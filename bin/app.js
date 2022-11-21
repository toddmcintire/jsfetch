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
} from 'node:os';
import chalk from 'chalk';
import * as logos from './os-logos.js';

/**
 * returns a number of the currently installed packages on a system.
 * @param {string} platform - devices platform.
 */
function packages(platform) {
	// if mac os
	if (platform === 'darwin') {
		const directory = spawnSync('brew', ['--cellar'], { encoding: 'utf8' });
		const myVar = directory.output[1];
		const fullText = `${myVar} | wc -l`;
		const replaced = fullText.replace(/\n|\r/g, '');
		return spawnSync('ls', [replaced], {
			shell: true,
			encoding: 'utf8',
		}).output[1].trim();
	}
	if (platform === 'win32') {
		return 'not supported';
	}
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
 * returns a string of the systems memory.
 * @param {string} platform - devices platform.
 */
function getMemory(platform) {
	if (platform === 'darwin') {
		const fullText = 'SPHardwareDataType |grep Memory';
		return spawnSync('system_profiler', [`${fullText}`], {
			shell: true,
			encoding: 'utf8',
		}).output[1].trim();
	}
	// if (platform === 'win32') {//TODO: return windows memory
	// }
}

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
console.log(chalk.yellow(`Memory: ${getMemory(name)}`));
