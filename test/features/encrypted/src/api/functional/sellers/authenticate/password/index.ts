/**
 * @packageDocumentation
 * @module api.functional.sellers.authenticate.password
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
//================================================================
import type { IConnection } from "@nestia/fetcher";
import { EncryptedFetcher } from "@nestia/fetcher/lib/EncryptedFetcher";
import type { Resolved } from "typia";

import type { ISeller } from "../../../../structures/ISeller";

/**
 * Change password.
 *
 * @param input Old and new passwords
 * @return Empty object
 *
 * @controller SellerAuthenticateController.change
 * @path PATCH /sellers/authenticate/password/change
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function change(
  connection: IConnection,
  input: change.Input,
): Promise<void> {
  return EncryptedFetcher.fetch(
    {
      ...connection,
      headers: {
        ...connection.headers,
        "Content-Type": "text/plain",
      },
    },
    {
      ...change.METADATA,
      template: change.METADATA.path,
      path: change.path(),
    },
    input,
  );
}
export namespace change {
  export type Input = Resolved<ISeller.IChangePassword>;

  export const METADATA = {
    method: "PATCH",
    path: "/sellers/authenticate/password/change",
    request: {
      type: "text/plain",
      encrypted: true,
    },
    response: {
      type: "application/json",
      encrypted: false,
    },
    status: 200,
  } as const;

  export const path = () => "/sellers/authenticate/password/change";
}
