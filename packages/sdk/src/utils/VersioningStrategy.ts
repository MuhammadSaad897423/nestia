import { VERSION_NEUTRAL, VersionValue } from "@nestjs/common/interfaces";

import { INestiaProject } from "../structures/INestiaProject";

export namespace VersioningStrategy {
  export const cast = (
    value: VersionValue | undefined,
  ): Array<string | typeof VERSION_NEUTRAL> =>
    value === undefined ? [] : Array.isArray(value) ? value : [value];

  export const merge =
    (project: Omit<INestiaProject, "config">) =>
    (values: Array<string | typeof VERSION_NEUTRAL>): string[] => {
      if (project.input.versioning === undefined) return [""];
      const set: Set<string | typeof VERSION_NEUTRAL> = new Set(values);
      const array: Array<string | typeof VERSION_NEUTRAL> =
        set.size === 0
          ? cast(project.input.versioning?.defaultVersion)
          : Array.from(set);
      return !!array?.length
        ? array.map((x) =>
            typeof x === "symbol"
              ? ""
              : `${project.input.versioning!.prefix}${x}`,
          )
        : [];
    };
}
