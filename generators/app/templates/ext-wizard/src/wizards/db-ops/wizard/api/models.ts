import * as azdata from 'azdata';

/**
 * Data model to communicate between Wizard pages
 */
export interface ConnectionModel {
	server: azdata.connection.ConnectionProfile;
	database: string;
}