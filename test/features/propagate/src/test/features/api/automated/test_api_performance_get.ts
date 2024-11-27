import type { IPropagation } from "@nestia/fetcher";
import typia from "typia";
import type { Primitive } from "typia";

import api from "../../../../api";
import type { IPerformance } from "../../../../api/structures/IPerformance";

export const test_api_performance_get = async (connection: api.IConnection) => {
  const output: IPropagation<
    {
      200: Primitive<IPerformance>;
    },
    200
  > = await api.functional.performance.get(connection);
  typia.assert(output);
};
