import { createFetch, createRequest } from "./factory";
import { v1Options, v2Options } from "./shared";
import type { CreateWeilaApiOptions } from "./types";

export class WeilaApi {
  v1 
  v2
  constructor(options: Omit<CreateWeilaApiOptions, 'options'>) {
    this.v1 =  {
      fetch: createFetch({ options: v1Options, ...options }),
      request: createRequest({ options: v1Options, ...options })
    }
    this.v2 = {
      fetch: createFetch({options: v2Options, ...options }),
      request: createRequest({ options: v2Options, ...options })
    }
  }
}
