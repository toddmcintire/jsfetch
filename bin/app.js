#! /usr/bin/env node

import { spawnSync, execSync } from 'node:child_process';
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
	if (platform === 'linux') {
		let response;
		try {
			response = execSync(`xrandr --current | grep '*'`).toString();
		} catch (error) {
			// console.log(error);
		}

		if (!response) {
			try {
				response = execSync(`xdpyinfo | grep dimensions`).toString();
			} catch (error) {
				// console.log(error);
				return undefined;
			}
		}
		const pattern = /\d*x\d*/;
		const data = response;
		const result = data.match(pattern);
		const resolution = result[0];
		return resolution;
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
