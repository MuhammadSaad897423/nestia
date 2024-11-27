import { SwaggerExample } from "@nestia/core";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { RouteParamtypes } from "@nestjs/common/enums/route-paramtypes.enum";
import { JsonMetadataFactory } from "typia/lib/factories/JsonMetadataFactory";
import { HttpFormDataProgrammer } from "typia/lib/programmers/http/HttpFormDataProgrammer";
import { HttpHeadersProgrammer } from "typia/lib/programmers/http/HttpHeadersProgrammer";
import { HttpParameterProgrammer } from "typia/lib/programmers/http/HttpParameterProgrammer";
import { HttpQueryProgrammer } from "typia/lib/programmers/http/HttpQueryProgrammer";

import { IReflectController } from "../structures/IReflectController";
import { IReflectHttpOperationParameter } from "../structures/IReflectHttpOperationParameter";
import { IReflectOperationError } from "../structures/IReflectOperationError";
import { IOperationMetadata } from "../transformers/IOperationMetadata";
import { TextPlainValidator } from "../transformers/TextPlainValidator";
import { HttpHeadersValidator } from "../validators/HttpHeadersValidator";
import { HttpQueryValidator } from "../validators/HttpQueryValidator";

export namespace ReflectHttpOperationParameterAnalyzer {
  export interface IContext {
    controller: IReflectController;
    function: Function;
    functionName: string;
    httpMethod: string;
    metadata: IOperationMetadata;
    errors: IReflectOperationError[];
  }
  export const analyze = (ctx: IContext): IReflectHttpOperationParameter[] => {
    const preconfigured: IReflectHttpOperationParameter.IPreconfigured[] =
      analyzePreconfigured(ctx);
    const errors: IReflectOperationError[] = [];

    //----
    // FIND CONTRADICTIONS
    //----
    // GET AND HEAD METHOD
    const contradictErrors: string[] = [];
    const contradict = (message: string) => {
      contradictErrors.push(message);
    };
    if (
      (ctx.httpMethod === "GET" || ctx.httpMethod === "HEAD") &&
      preconfigured.some((x) => x.category === "body")
    )
      contradict(`@Body() is not allowed in the ${ctx.httpMethod} method.`);

    // FIND DUPLICATED BODY
    if (
      preconfigured.filter(
        (x) => x.category === "body" && x.field === undefined,
      ).length > 1
    )
      contradict(`Duplicated @Body() is not allowed.`);
    if (
      preconfigured.filter(
        (x) => x.category === "query" && x.field === undefined,
      ).length > 1
    )
      contradict(`Duplicated @Query() without field name is not allowed.`);
    if (
      preconfigured.filter(
        (x) => x.category === "headers" && x.field === undefined,
      ).length > 1
    )
      contradict(`Duplicated @Headers() without field name is not allowed.`);

    // FIND DUPLICATED FIELDS
    if (
      isUnique(
        preconfigured
          .filter((x) => x.category === "param")
          .map((x) => x.field)
          .filter((field) => field !== undefined),
      ) === false
    )
      contradict(`Duplicated field names of path are not allowed.`);
    if (
      isUnique(
        preconfigured
          .filter((x) => x.category === "query")
          .map((x) => x.field)
          .filter((field) => field !== undefined),
      ) === false
    )
      contradict(`Duplicated field names of query are not allowed.`);
    if (
      isUnique(
        preconfigured
          .filter((x) => x.category === "headers")
          .map((x) => x.field)
          .filter((field) => field !== undefined),
      ) === false
    )
      contradict(`Duplicated field names of headers are not allowed.`);
    if (contradictErrors.length)
      errors.push({
        file: ctx.controller.file,
        class: ctx.controller.class.name,
        function: ctx.functionName,
        from: "",
        contents: contradictErrors,
      });

    //----
    // COMPOSE PARAMETERS
    //----
    const parameters: IReflectHttpOperationParameter[] = preconfigured
      .map((p): IReflectHttpOperationParameter | null => {
        // METADATA INFO
        const pErrorContents: Array<string | IOperationMetadata.IError> = [];
        const matched: IOperationMetadata.IParameter | undefined =
          ctx.metadata.parameters.find((x) => x.index === p.index);
        const report = () => {
          errors.push({
            file: ctx.controller.file,
            class: ctx.controller.class.name,
            function: ctx.functionName,
            from: `parameter ${matched ? JSON.stringify(matched.name) : `of ${p.index} th`}`,
            contents: pErrorContents,
          });
          return null;
        };

        // VALIDATE TYPE
        if (matched === undefined)
          pErrorContents.push(`Unable to find parameter type.`);
        else if (matched.type === null)
          pErrorContents.push(`Failed to get the type info.`);

        // CONSIDER KIND
        const schema: IOperationMetadata.ISchema | null = (() => {
          if (matched === undefined) return null;
          const result =
            p.category === "body" &&
            (p.contentType === "application/json" || p.encrypted === true)
              ? matched.primitive
              : matched.resolved;
          return result.success ? result.data : null;
        })();
        if (p.category === "body" && p.field !== undefined)
          pErrorContents.push(`@Body() must not have a field name.`);
        else if (p.category === "param" && p.field === undefined)
          pErrorContents.push(`@Param() must have a field name.`);

        if (pErrorContents.length) return report();
        else if (
          matched === undefined ||
          matched.type === null ||
          schema === null
        )
          return null; // unreachable

        const example: SwaggerExample.IData<any> | undefined = (
          Reflect.getMetadata(
            "nestia/SwaggerExample/Parameters",
            ctx.controller.class.prototype,
            ctx.functionName,
          ) ?? []
        ).find((x: SwaggerExample.IData<any>) => x.index === matched.index);

        // COMPOSITION
        if (p.category === "param")
          return {
            category: p.category,
            index: p.index,
            field: p.field!,
            name: matched.name,
            type: matched.type,
            validate: HttpParameterProgrammer.validate,
            description: matched.description,
            jsDocTags: matched.jsDocTags,
            example: example?.example,
            examples: example?.examples,
            ...schema,
          };
        else if (p.category === "query")
          return {
            category: p.category,
            index: p.index,
            field: p.field ?? null,
            name: matched.name,
            type: matched.type,
            validate: p.field
              ? HttpQueryValidator.validate
              : HttpQueryProgrammer.validate,
            description: matched.description,
            jsDocTags: matched.jsDocTags,
            example: example?.example,
            examples: example?.examples,
            ...schema,
          };
        else if (p.category === "headers")
          return {
            category: p.category,
            index: p.index,
            field: p.field ?? null,
            name: matched.name,
            type: matched.type,
            validate: p.field
              ? HttpHeadersValidator.validate
              : HttpHeadersProgrammer.validate,
            description: matched.description,
            jsDocTags: matched.jsDocTags,
            example: example?.example,
            examples: example?.examples,
            ...schema,
          };
        else if (p.category === "body")
          return {
            category: p.category,
            index: p.index,
            encrypted: !!p.encrypted,
            contentType: p.contentType,
            name: matched.name,
            type: matched.type,
            validate:
              p.contentType === "application/json" || p.encrypted === true
                ? JsonMetadataFactory.validate
                : p.contentType === "application/x-www-form-urlencoded"
                  ? HttpQueryProgrammer.validate
                  : p.contentType === "multipart/form-data"
                    ? HttpFormDataProgrammer.validate
                    : TextPlainValidator.validate,
            description: matched.description,
            jsDocTags: matched.jsDocTags,
            example: example?.example,
            examples: example?.examples,
            ...schema,
          };
        else {
          pErrorContents.push(`Unknown kind of the parameter.`);
          return report();
        }
      })
      .filter((x): x is IReflectHttpOperationParameter => x !== null);

    if (errors.length) ctx.errors.push(...errors);
    return parameters;
  };

  const analyzePreconfigured = (
    props: IContext,
  ): IReflectHttpOperationParameter.IPreconfigured[] => {
    const dict: NestParameters | undefined = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      props.controller.class,
      props.functionName,
    );
    if (dict === undefined) return [];
    return Object.entries(dict)
      .map(([key, param]) => analyzeHttpParameter(key, param))
      .filter(
        (x): x is IReflectHttpOperationParameter.IPreconfigured => x !== null,
      )
      .sort((x, y) => x.index - y.index);
  };

  const analyzeHttpParameter = (
    key: string,
    param: INestParam,
  ): IReflectHttpOperationParameter.IPreconfigured | null => {
    const symbol: string = key.split(":")[0];
    if (symbol.indexOf("__custom") !== -1) return analyzeCustomParameter(param);

    const category:
      | IReflectHttpOperationParameter.IPreconfigured["category"]
      | null = getNestParamType(Number(symbol[0]) as RouteParamtypes);
    if (category === null) return null;
    if (category === "body")
      return {
        category: "body",
        index: param.index,
        field: param.data,
        contentType: "application/json",
      };
    else
      return {
        category,
        index: param.index,
        field: param.data,
      };
  };

  const analyzeCustomParameter = (
    param: INestParam,
  ): IReflectHttpOperationParameter.IPreconfigured | null => {
    if (param.factory === undefined) return null;
    else if (
      param.factory.name === "EncryptedBody" ||
      param.factory.name === "PlainBody" ||
      param.factory.name === "TypedQueryBody" ||
      param.factory.name === "TypedBody" ||
      param.factory.name === "TypedFormDataBody"
    )
      return {
        category: "body",
        index: param.index,
        encrypted: param.factory.name === "EncryptedBody",
        contentType:
          param.factory.name === "PlainBody" ||
          param.factory.name === "EncryptedBody"
            ? "text/plain"
            : param.factory.name === "TypedQueryBody"
              ? "application/x-www-form-urlencoded"
              : param.factory.name === "TypedFormDataBody"
                ? "multipart/form-data"
                : "application/json",
      };
    else if (param.factory.name === "TypedHeaders")
      return {
        category: "headers",
        index: param.index,
        field: param.data,
      };
    else if (param.factory.name === "TypedParam")
      return {
        category: "param",
        index: param.index,
        field: param.data,
      };
    else if (param.factory.name === "TypedQuery")
      return {
        category: "query",
        index: param.index,
        field: undefined,
      };
    else return null;
  };

  const isUnique = (values: string[]) => new Set(values).size === values.length;
}

type NestParameters = {
  [key: string]: INestParam;
};
interface INestParam {
  name: string;
  index: number;
  factory?: (...args: any) => any;
  data: string | undefined;
}

const getNestParamType = (value: RouteParamtypes) => {
  if (value === RouteParamtypes.BODY) return "body";
  else if (value === RouteParamtypes.HEADERS) return "headers";
  else if (value === RouteParamtypes.QUERY) return "query";
  else if (value === RouteParamtypes.PARAM) return "param";
  return null;
};
