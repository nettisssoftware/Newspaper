declare module "pagedjs" {
  export class Previewer {
    constructor(options?: Record<string, unknown>);
    preview(
      content: HTMLElement | string,
      stylesheets: string[] | string,
      renderTo: HTMLElement,
    ): Promise<{ pages: unknown[]; performance: number }>;
  }
}
