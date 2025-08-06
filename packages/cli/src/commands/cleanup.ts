import { cleanup as cleanupLib } from "@next-dev-utils/utils";

type Options = {
	verbose: boolean;
	dryRun: boolean;
};

export async function cleanupCommand(options: Options) {
	await cleanupLib({
		verbose: options.verbose,
		dryRun: options.dryRun,
	});
}