import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import Multer from "multer";
import { tags } from "typia";

@Controller("multipart")
export class MultipartController {
  @core.TypedRoute.Post()
  public post(@core.TypedFormData.Body(() => Multer()) body: IMultipart): void {
    body;
  }
}

interface IMultipart {
  id: string & tags.Format<"uuid">;
  strings: string[];
  number: number;
  integers: Array<number & tags.Type<"int32">>;
  blob: Blob;
  blobs: Blob[];
  file: File;
  files: File[];
}
