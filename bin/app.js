#! /usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
	platform,
	userInfo,
	hostname,
	arch,
	uptime,
	release,
	version,
	totalmem,
} from 'node:os';
import chalk from 'chalk';
import * as logos from './os-logos.js';
import { argv } from 'node:process';

/**
 * returns a number of the currently installed packages on a system.
 * @param {string} OS - devices platform.
 */
function packages(OS) {
	// if mac os
	if (OS === 'darwin') {
		const directory = spawnSync('brew', ['--cellar'], { encoding: 'utf8' });
		const myVar = directory.output[1];
		const fullText = `${myVar} | wc -l`;
		const replaced = fullText.replace(/\n|\r/g, '');
		return spawnSync('ls', [replaced], {
			shell: true,
			encoding: 'utf8',
		}).output[1].trim();
	}

	// Pass on my VM running Xubuntu
	if (OS === 'linux') {
		try {
			const aptList = spawnSync('apt', ['list', '--installed'], {
				encoding: 'utf8',
			});
			return aptList.output[1].match(/\n/g).length - 1;
		} catch (err) {
			return 'distribution not supported ';
		}
	}

	if (OS === 'win32') {
		// return 'not supported';
	}

	return 'not supported';
}

/**
 * converts time to a formatted string.
 * @param {number} time - computers uptime in seconds.
 */
function timeConvert(time) {
	const min = time / 60;
	const hour = time / 3600;
	const day = time / 86400;
	return `time is minuet's: ${Math.floor(min)}, hour's: ${Math.floor(
		hour
	)}, day's: ${Math.floor(day)} `;
}

/**
 * returns the users shell.
 */
function shellCheck(platform) {
	if (platform === 'darwin' || platform === 'linux') {
		return userInfo(['utf8']).shell;
	}
	if (platform === 'win32') {
		const shell = spawnSync('$host.Name', { encoding: 'utf8' });
		if (shell.output === null) {
			return 'CMD';
		}
		if (shell.output[1].trim() === 'ConsoleHost') {
			return 'Powershell';
		}
	}
}

// resolution
function getResolution(platform) {
	// based on platform issue command that gets screen resolution and then
	if (platform === 'darwin') {
		const fullText = 'SPDisplaysDataType |grep Resolution';
		return spawnSync('system_profiler', [`${fullText}`], {
			shell: true,
			encoding: 'utf8',
		}).output[1].trim();
	}
	if (platform === 'win32') {
		const height = spawnSync(
			'wmic',
			['desktopmonitor', 'get', 'screenheight'],
			{
				encoding: 'utf8',
			}
		);
		const width = spawnSync('wmic', ['desktopmonitor', 'get', 'screenwidth'], {
			encoding: 'utf8',
		});
		return `${String(width.output[1].trim().replace(/^\D+/g, ''))}x${String(
			height.output[1].trim().replace(/^\D+/g, '')
		)}`;
	}
}

/**
 * returns a string of the systems CPU.
 * @param {string} platform - devices platform.
 */
function getCPU(platform) {
	if (platform === 'darwin') {
		return spawnSync('sysctl', ['-n machdep.cpu.brand_string'], {
			shell: true,
			encoding: 'utf8',
		}).output[1].trim();
	}
	if (platform === 'win32') {
		// TODO: return cpu
	}
}

/**
 * returns a string of the systems GPU.
 * @param {string} platform - devices platform.
 */
function getGPU(platform) {
	if (platform === 'darwin') {
		const fullText = 'SPDisplaysDataType |grep Chipset';
		return spawnSync('system_profiler', [`${fullText}`], {
			shell: true,
			encoding: 'utf8',
		}).output[1].trim();
	}
	if (platform === 'win32') {
		const gpu = spawnSync(
			'wmic',
			['path', 'win32_videoController', 'get', 'name'],
			{ encoding: 'utf8' }
		).output[1].split('\n');
		gpu.splice(0, 1);
		gpu.splice(1, 2);
		return gpu.join('\n').trim();
	}
}

/**
 * returns a rounded number of the users total installed memory in GB
 * @param {number} memoryInt - total memory of system in bytes.
 */
function displayMemory(memoryInt) {
	return Math.floor(Math.floor(memoryInt / 1000000) / 1024);
}

/**
 * returns a system logo
 * @param {string} OS - devices platform.
 */
function displayLogo(OS) {
	return logos[OS] || ':::OS LOGO:::';
}

const name = platform();
const colors = [
	'red',
	'green',
	'yellow',
	'blue',
	'magenta',
	'cyan',
	'white',
	'gray',
	'black',
	'rainbow',
];
const choice = argv[2];

let componentsWithColorsToDisplay = [];
let noSupportedColor = false;

// TODO: separate logo from rest of information
// TODO:desktop environment
// TODO:window manager
// TODO:terminal
// TODO:terminal font

if (colors.includes(choice)) {
	if (choice === 'rainbow') {
		componentsWithColorsToDisplay = [
			chalk.red(`${userInfo().username}@${hostname()}`),
			'-----------------',
			chalk.rgb(255, 87, 51)(`OS: ${name} ${release()} ${arch()}`),
			chalk.rgb(255, 87, 51)(`Kernel: ${version()}`),
			chalk.yellow(`Uptime: ${timeConvert(uptime())}`),
			chalk.yellow(`packages: ${packages(name)}`),
			chalk.green(`shell: ${shellCheck(name)}`),
			chalk.green(`${getResolution(name)}`),
			chalk.blue(`CPU: ${getCPU(name)}`),
			chalk.blue(`GPU: ${getGPU(name)}`),
			chalk.rgb(143, 0, 255)(`Memory: ${displayMemory(totalmem())}GB`),
		];
	}
	else {
		componentsWithColorsToDisplay = [
			chalk[choice](`${userInfo().username}@${hostname()}`),
			'-----------------',
			chalk[choice](`OS: ${name} ${release()} ${arch()}`),
			chalk[choice](`Kernel: ${version()}`),
			chalk[choice](`Uptime: ${timeConvert(uptime())}`),
			chalk[choice](`packages: ${packages(name)}`),
			chalk[choice](`shell: ${shellCheck(name)}`),
			chalk[choice](`${getResolution(name)}`),
			chalk[choice](`CPU: ${getCPU(name)}`),
			chalk[choice](`GPU: ${getGPU(name)}`),
			chalk[choice](`Memory: ${displayMemory(totalmem())}GB`),
		];
	}
	
}
else if (!choice) {
	componentsWithColorsToDisplay = [
		chalk.yellow(`${userInfo().username}@${hostname()}`),
		'-----------------',
		chalk.blue(`OS: ${name} ${release()} ${arch()}`),
		chalk.red(`Kernel: ${version()}`),
		chalk.red(`Uptime: ${timeConvert(uptime())}`),
		chalk.yellow(`packages: ${packages(name)}`),
		chalk.yellow(`shell: ${shellCheck(name)}`),
		chalk.yellow(`${getResolution(name)}`),
		chalk.yellow(`CPU: ${getCPU(name)}`),
		chalk.yellow(`GPU: ${getGPU(name)}`),
		chalk.yellow(`Memory: ${displayMemory(totalmem())}GB`),
	];
}
else {
	noSupportedColor = true;
	console.log('******************************');
	console.log('color not supported: ', choice);
	console.log('******************************');
}

//If the user selected a supported color then we print the info
if (!noSupportedColor) {
	printInfo(componentsWithColorsToDisplay, name);
}

/**
 * Method to print the info simulating to columns, the first one with the logo of 
 * the SO and the second with the user computer info
 * @param {array} listOfComponents List of the components to print next to the logo
 * @param {string} namePlatform Name of the user platform (SO)
 */
function printInfo(listOfComponents, namePlatform) {

	let logosColors = {
		'darwin': 'white',
		'linux': 'yellow',
		'win32': 'cyan',
	}

	let platformLogo = displayLogo(namePlatform);

	/* 
		Check which array is longer, because there is the case like with linux where the logo is
		smaller than the system info
	*/
	let leng = platformLogo.length > listOfComponents.length ? platformLogo.length : listOfComponents.length;

	let longestPartLogo = 0;

	for(let i = 0; i < leng; i++) {
		//Get line of platform logo
		let logoPortion = platformLogo[i];
		//Get component to show
		let component = listOfComponents[i];

		//If we are still printing the logo we are going to check if this is the longest part of the logo
		if (logoPortion) {
			let lengthOfLogoPortion = logoPortion.split('').length;
			//If the length of this portion is greater than the one we have stored, store this one
			if (lengthOfLogoPortion > longestPartLogo) longestPartLogo = lengthOfLogoPortion;
		}
		let logoPart = logoPortion ? chalk[logosColors[namePlatform]](`${logoPortion}`) : ' '.repeat(longestPartLogo);
		let componentPart = (component ? component : '');

		//Print the logo and next to it the component
		console.log(`${logoPart}\t${componentPart}`);
	}
}
