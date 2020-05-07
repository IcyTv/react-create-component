declare module "read-package-json" {
	function readJson(
		file: string,
		logFn?: any,
		strict?: boolean,
		cb?: (err: any, data: any) => void
	): any;
	export = readJson;
}
