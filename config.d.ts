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
    Database: string;
    /**
     * @visibility frontend
     */
    OutputLocation: string;
    /**
     * @visibility frontend
     */
    WorkGroup: string;
    /**
     * @visibility frontend
     */
    region: string;
  };
}
