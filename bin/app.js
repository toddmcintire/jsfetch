import * as child from 'node:child_process';
import * as os from 'node:os';
import chalk from 'chalk';

/**
 * returns a number of the currently installed packages on a system.
 * @param {string} platform - devices platform.
 */
function packages(platform) {
	
	//if mac os
	if (platform === 'darwin') {
		let directory = child.spawnSync('brew', ['--cellar'], { encoding : 'utf8' });
		let myVar = directory.output[1];
		let fullText = `${myVar} | wc -l`;
		let replaced = fullText.replace(/\n|\r/g, "");
		return child.spawnSync('ls', [replaced], {shell: true, encoding: 'utf8'}).output[1].trim();
	} 
	
	else if (platform === "win32") {
		return "not supported"
	}
}

/**
 * converts time to a formmated string.
 * @param {number} time - computers uptime in seconds.
 */
function timeConvert(time) {
	let min = time / 60;
	let hour = time / 3600;
	let day = time / 86400;
	return `time is seconds ${time}, min: ${min}, hour: ${hour}, day: ${day} `;
}

/**
 * returns the users shell.
 */
function shellCheck(platform) {
	if (platform === 'darwin'){
		return child.spawnSync(`echo`,['"$SHELL"'], {shell: true, encoding : 'utf8' }).output[1].trim();
	}

	else if (platform ==='win32') {
		let shell = child.spawnSync('$host.Name', {encoding : 'utf8'})
		if (shell.output === null) {
			return "CMD"
		} else if (shell.output[1].trim() === "ConsoleHost") {
			return "Powershell"
		}
	}
}


//resoltion
function getResolution(platform) {
	//based on platform issue command that gets screen resolution and then 
	if (platform === 'darwin') {
		const fullText = 'SPDisplaysDataType |grep Resolution';
		return child.spawnSync('system_profiler', [`${fullText}`], {shell: true, encoding: 'utf8'}).output[1].trim();
	}

	else if (platform === 'win32') {
		let height = child.spawnSync('wmic', ['desktopmonitor', 'get', 'screenheight'], {encoding : 'utf8'});
		let width = child.spawnSync('wmic', ['desktopmonitor', 'get', 'screenwidth'], {encoding : 'utf8'});
		return String(width.output[1].trim().replace( /^\D+/g, '')) + "x"+ String(height.output[1].trim().replace( /^\D+/g, ''));
	}
}

/**
 * returns a string of the systems CPU.
 * @param {string} platform - devices platform.
 */
function getCPU(platform) {
	if (platform === 'darwin') {return macCPU()}
	
	function macCPU() {
		const cpuCommand = child.spawnSync('sysctl', ['-n machdep.cpu.brand_string'], {shell: true, encoding: 'utf8'});
		return cpuCommand.output[1].trim(); 
	}
}

/**
 * returns a string of the systems GPU.
 * @param {string} platform - devices platform.
 */
 function getGPU(platform) {
	if (platform === 'darwin') {return macGPU()}
	if (platform === 'win32') {return windowsGPU()}
	
	function macGPU() {
		const fullText = 'SPDisplaysDataType |grep Chipset';
		return child.spawnSync('system_profiler', [`${fullText}`], {shell: true, encoding: 'utf8'}).output[1].trim();
	}

	function windowsGPU() {
		let gpu = child.spawnSync('wmic', ['path', 'win32_videoController', 'get', 'name'], {encoding : 'utf8'});
		var lines = gpu.output[1].split('\n');
		lines.splice(0,1);
		lines.splice(1,2);
		return lines.join('\n').trim();
	}
}

/**
 * returns a string of the systems memory.
 * @param {string} platform - devices platform.
 */
 function getMemory(platform) {
	if (platform === 'darwin') {return macMemory()}
	
	function macMemory() {
		const fullText = 'SPHardwareDataType |grep Memory';
		return child.spawnSync('system_profiler', [`${fullText}`], {shell: true, encoding: 'utf8'}).output[1].trim();
	}

	function windowsMemory() {
		
	}
}

function displayLogo(platform) {
	if (platform === 'darwin') {
		let logo = `	  	    'c.
		 ,xNMM.
	       .OMMMMo
               OMMM0,
     .;loddo:.  .olloddol;.
   cKMMMMMMMMMMNWMMMMMMMMMM0:
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.
 XMMMMMMMMMMMMMMMMMMMMMMMX.
;MMMMMMMMMMMMMMMMMMMMMMMM:
:MMMMMMMMMMMMMMMMMMMMMMMM:
.MMMMMMMMMMMMMMMMMMMMMMMMX.
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.
 .XMMMMMMMMMMMMMMMMMMMMMMMMMMk
  .XMMMMMMMMMMMMMMMMMMMMMMMMK.
    kMMMMMMMMMMMMMMMMMMMMMMd
     ;KMMMMMMMWXXWMMMMMMMk.
       .cooc,.    .,coo:.`
	   return logo;
	}
}

let name = os.platform()
console.log(chalk.yellow(`${displayLogo(name)}`));
//TODO: seperate logo from rest of information
console.log(chalk.yellow(`${os.userInfo().username}@${os.hostname()}`));
console.log('-----------------');
console.log(chalk.blue(`OS: ${name} ${os.release()} ${os.arch()}`));
console.log(chalk.red(`Kernel: ${os.version()}`));
console.log(chalk.red(`Uptime: ${timeConvert(os.uptime())}`));
console.log(chalk.yellow(`packages: ${packages(name)}`));
console.log(chalk.yellow(`shell: ${shellCheck(name)}`));
console.log(chalk.yellow(`${getResolution(name)}`));
//TODO:desktop enviornment
//TODO:window manager
//TODO:terminal
//TODO:terminal font
console.log(chalk.yellow(`CPU: ${getCPU(name)}`));
console.log(chalk.yellow(`GPU: ${getGPU(name)}`));
console.log(chalk.yellow(`Memory: ${getMemory(name)}`));