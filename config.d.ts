export interface Config {
  economize: {
    /**
     * @visibility frontend
     */
    table: string;
    /**
     * @visibility frontend
     */
    accessKeyId: string;
    /**
     * @visibility frontend
     */
    secretAccessKey: string;
    /**
     * @visibility frontend
     */
    database: string;
    /**
     * @visibility frontend
     */
    outputLocation: string;
    /**
     * @visibility frontend
     */
    workGroup: string;
    /**
     * @visibility frontend
     */
    region: string;
    /**
     * @visibility frontend
     */
    apiKey: string;
    /**
     * @visibility frontend
     */
    hostname: string;
  };
}
