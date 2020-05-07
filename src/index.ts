#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import program from "commander";
import cliSelect from "cli-select";
import Spinner from "@slimio/async-cli-spinner";
import cursor from "cli-cursor";
import readJson from "read-package-json";
import prompt from "prompts";
import fs from "fs";
import path from "path";

import { promisify } from "util";
const dev = false;

const templatePaths = ["react/index.ts"];

const cliSelectDefault = (
	values: string[],
	colorSelect: string,
	color: string
) => {
	return {
		values: values,
		valueRenderer: (value: string, selected: boolean) => {
			if (selected) {
				return chalk[colorSelect](value);
			} else {
				return chalk[color](value);
			}
		},
		selected: ">",
		unselected: " ",
		indentation: 2,
	};
};

const main = async () => {
	cursor.hide();
	console.log(
		chalk.blue(
			figlet.textSync("create-component-cli", {
				font: "Avatar",
				horizontalLayout: "controlled smushing",
			})
		)
	);
	let data = await promisify(readJson)("package.json");
	if (
		!program.force &&
		Object.keys(data.dependencies).indexOf("react-scripts") < 0
	) {
		console.log(
			chalk.bgYellow(
				chalk.red(
					"No React installation found, are you sure you are in the right folder?"
				)
			)
		);
		const confirm = await cliSelect(
			cliSelectDefault(["Yes", "No"], "red", "gray")
		);
		if (confirm.value === "No") {
			return;
		} else {
			console.log(
				chalk.bgYellow(
					chalk.red(
						"Please make sure you have react scripts! You can use create-react-app to create a new react app!"
					)
				)
			);
		}
	}

	// if (!process.argv.slice(2).length) {
	// 	program.outputHelp();
	// }

	let selection: any;
	if (!program.type) {
		console.log(chalk.yellow("What Component do you want to create?"));

		selection = await cliSelect(
			cliSelectDefault(["Component", "Page"], "green", "blueBright")
		);
	} else {
		selection = { value: program.type };
	}

	if (program.dir) {
		console.log(chalk.yellow("Creating in new folder"));
	} else {
		console.log(
			chalk.red(
				"Not creating in new folder. To create in new folder, unset --no-dir"
			)
		);
	}

	let css = program.css || "css";
	if (
		(!program.css &&
			Object.keys(data.dependencies).indexOf("node-sass") >= 0) ||
		dev
	) {
		console.log(
			chalk.yellow(
				"We detected a css parser, which css version do you want to use?"
			)
		);
		css = (
			await cliSelect(
				cliSelectDefault(["Scss", "Css"], "green", "blueBright")
			)
		).value.toLowerCase();
	}

	let ionic = program.ionic || false;

	if (
		(!program.ionic &&
			Object.keys(data.dependencies).indexOf("@ionic/react")) ||
		dev
	) {
		console.log(
			chalk.yellow(
				`We detected an Ionic installation, do you want to create an ionic ${selection.value.toLowerCase()}?`
			)
		);
		ionic =
			(
				await cliSelect(
					cliSelectDefault(["Yes", "No"], "green", "blueBright")
				)
			).value === "Yes";
	}

	let name: string;
	if (typeof program.name === "function") {
		name = (
			await prompt({
				type: "text",
				name: "name",
				message: chalk.yellow(
					`What is the name of your ${selection.value.toLowerCase()}?`
				),
			})
		).name;
	} else {
		name = (program as any).name;
	}

	const spinner = new Spinner({
		prefixText: chalk.green(
			`Creating${ionic ? " Ionic" : ""} ${selection.value}`
		),
	});
	spinner.text = "Reading template files";
	spinner.start();

	const outFolder = `${program.path}/${selection.value.toLowerCase() + "s"}/${
		program.dir ? name : ""
	}/`;

	let templates = templatePaths.concat([
		`${
			ionic ? "ionic" : "react"
		}/${selection.value.toLowerCase()}/Component.tsx`,
		`react/Component.${css}`,
	]);
	let files = templates.map((templateName) =>
		promisify(fs.exists)(outFolder)
			.then((exists) => {
				if (!exists) {
					return promisify(fs.mkdir)(outFolder, { recursive: true });
				} else {
					return new Promise((resolve, reject) => {
						resolve();
					});
				}
			})
			.then(() => {
				return promisify(fs.readFile)(
					path.resolve(__dirname) +
						`/assets/templates/${templateName}`
				);
			})

			.then((data) => {
				spinner.text = "Writing files";
				return new Promise((resolve) => resolve(data.toString()));
			})
			.then((data: string) => {
				if (data.startsWith("import")) {
					data = data
						.replace(/{{COMPONENT_NAME}}/g, name)
						.replace(/{{CSS_TYPE}}/g, css);
				}

				return new Promise((resolve, reject) => {
					resolve(data);
				});
			})
			.then((data) => {
				let tempName = templateName.split("/").slice(-1)[0];
				let fname = tempName == "index.ts" ? "index" : name;
				return promisify(fs.writeFile)(
					outFolder +
						`${fname}.${templateName.split(".").slice(-1)[0]}`,
					data
				);
			})
	);
	Promise.all(files)
		.then(() => {
			spinner.succeed("All files created!");
		})
		.catch((err) => {
			spinner.failed(err.message);
			// console.log(
			// 	chalk.bgYellow(chalk.red("An Error occurred", err.message))
			// 	);
		});

	// cursor.show();
};
clear();

program
	.version("alpha-0.0.1")
	.description("A simple cli for creating react components")
	.option("-p --path <path>", "Path to create components in", "./src")
	.option("--css <parser>", "CSS parser type [css/scss]")
	.option("--ionic", "Force using ionic")
	.option("--no-dir", "Don't create seperate folders for components")
	.option("-n --name <name>", "Your components name")
	.option("-t --type <type>", "Type of component to create [Component/Page]")
	.option("-f --force", "Force installation without react")
	.parse(process.argv);

if (
	program.type &&
	!(
		(program as any).type.toLowerCase() === "page" ||
		(program as any).type.toLowerCase() === "component"
	)
) {
	console.log("Invalid type");
	program.outputHelp();
	process.exit();
}

main().catch((err) => {
	console.error(chalk.bgRed(chalk.yellow(err.messsage)));
});
