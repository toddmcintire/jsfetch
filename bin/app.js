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

if (colors.includes(choice) === true) {
	if (choice === 'rainbow') {
		console.log(chalk.red(`${displayLogo(name)}`));
		// TODO: separate logo from rest of information
		console.log(chalk.red(`${userInfo().username}@${hostname()}`));
		console.log('-----------------');
		console.log(chalk.rgb(255, 87, 51)(`OS: ${name} ${release()} ${arch()}`));
		console.log(chalk.rgb(255, 87, 51)(`Kernel: ${version()}`));
		console.log(chalk.yellow(`Uptime: ${timeConvert(uptime())}`));
		console.log(chalk.yellow(`packages: ${packages(name)}`));
		console.log(chalk.green(`shell: ${shellCheck(name)}`));
		console.log(chalk.green(`${getResolution(name)}`));
		// TODO:desktop environment
		// TODO:window manager
		// TODO:terminal
		// TODO:terminal font
		console.log(chalk.blue(`CPU: ${getCPU(name)}`));
		console.log(chalk.blue(`GPU: ${getGPU(name)}`));
		console.log(
			chalk.rgb(143, 0, 255)(`Memory: ${displayMemory(totalmem())}GB`)
		);
	} else {
		console.log(chalk[choice](`${displayLogo(name)}`));
		// TODO: separate logo from rest of information
		console.log(chalk[choice](`${userInfo().username}@${hostname()}`));
		console.log('-----------------');
		console.log(chalk[choice](`OS: ${name} ${release()} ${arch()}`));
		console.log(chalk[choice](`Kernel: ${version()}`));
		console.log(chalk[choice](`Uptime: ${timeConvert(uptime())}`));
		console.log(chalk[choice](`packages: ${packages(name)}`));
		console.log(chalk[choice](`shell: ${shellCheck(name)}`));
		console.log(chalk[choice](`${getResolution(name)}`));
		// TODO:desktop environment
		// TODO:window manager
		// TODO:terminal
		// TODO:terminal font
		console.log(chalk[choice](`CPU: ${getCPU(name)}`));
		console.log(chalk[choice](`GPU: ${getGPU(name)}`));
		console.log(chalk[choice](`Memory: ${displayMemory(totalmem())}GB`));
	}
} else if (choice === undefined) {
	console.log(chalk.cyan(`${displayLogo(name)}`));
	// TODO: separate logo from rest of information
	console.log(chalk.yellow(`${userInfo().username}@${hostname()}`));
	console.log('-----------------');
	console.log(chalk.blue(`OS: ${name} ${release()} ${arch()}`));
	console.log(chalk.red(`Kernel: ${version()}`));
	console.log(chalk.red(`Uptime: ${timeConvert(uptime())}`));
	console.log(chalk.yellow(`packages: ${packages(name)}`));
	console.log(chalk.yellow(`shell: ${shellCheck(name)}`));
	console.log(chalk.yellow(`${getResolution(name)}`));
	// TODO:desktop environment
	// TODO:window manager
	// TODO:terminal
	// TODO:terminal font
	console.log(chalk.yellow(`CPU: ${getCPU(name)}`));
	console.log(chalk.yellow(`GPU: ${getGPU(name)}`));
	console.log(chalk.yellow(`Memory: ${displayMemory(totalmem())}GB`));
} else {
	console.log('color not supported', choice);
}
