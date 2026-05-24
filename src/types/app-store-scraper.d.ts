declare module "app-store-scraper" {
  type AppStoreApp = {
    title: string;
    developer: string;
    icon?: string;
    score?: number;
    primaryGenre?: string;
    [key: string]: unknown;
  };

  const scraper: {
    app(options: { id: string }): Promise<AppStoreApp>;
  };

  export default scraper;
}
