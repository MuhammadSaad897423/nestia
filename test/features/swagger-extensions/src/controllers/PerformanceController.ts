import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { ApiExtension } from "@nestjs/swagger";

import { IPerformance } from "@api/lib/structures/IPerformance";

@Controller("performance")
export class PerformanceController {
  @ApiExtension("x-visibility", "public")
  @ApiExtension("x-deprecated", true)
  @core.TypedRoute.Get()
  public async get(): Promise<IPerformance> {
    return {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      resource: process.resourceUsage(),
    };
  }
}
