#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VersionManager {
    constructor() {
        this.versionFile = path.join(__dirname, '..', 'version.ver');
        this.packageFile = path.join(__dirname, '..', 'package.json');
    }

    getCurrentVersion() {
        try {
            if (fs.existsSync(this.versionFile)) {
                return fs.readFileSync(this.versionFile, 'utf8').trim();
            }
        } catch (error) {
            console.warn('Could not read version file, defaulting to 0.1.0');
        }
        return '0.1.0';
    }

    parseVersion(version) {
        const [major, minor, patch] = version.split('.').map(Number);
        return { major: major || 0, minor: minor || 1, patch: patch || 0 };
    }

    formatVersion(major, minor, patch) {
        return `${major}.${minor}.${patch}`;
    }

    analyzeCommitMessages() {
        try {
            // Get commits since last tag or from beginning
            const lastTag = this.getLastTag();
            const command = lastTag 
                ? `git log ${lastTag}..HEAD --oneline`
                : 'git log --oneline';
            
            const commits = execSync(command, { encoding: 'utf8' }).trim();
            
            if (!commits) {
                return { type: 'none', reason: 'No new commits' };
            }

            const commitLines = commits.split('\n');
            
            // Analyze commit messages for version type
            let hasMajor = false;
            let hasMinor = false;
            let hasPatch = false;

            for (const commit of commitLines) {
                const message = commit.toLowerCase();
                
                // Major version indicators
                if (message.includes('breaking') || 
                    message.includes('major:') ||
                    message.includes('!:') ||
                    message.includes('redesign') ||
                    message.includes('rewrite')) {
                    hasMajor = true;
                }
                
                // Minor version indicators
                else if (message.includes('feat:') || 
                         message.includes('feature:') ||
                         message.includes('minor:') ||
                         message.includes('add') ||
                         message.includes('new')) {
                    hasMinor = true;
                }
                
                // Patch version indicators
                else if (message.includes('fix:') ||
                         message.includes('patch:') ||
                         message.includes('bug') ||
                         message.includes('hotfix')) {
                    hasPatch = true;
                }
            }

            // Determine version bump type (highest priority wins)
            if (hasMajor) {
                return { type: 'major', reason: 'Breaking changes detected' };
            } else if (hasMinor) {
                return { type: 'minor', reason: 'New features detected' };
            } else if (hasPatch) {
                return { type: 'patch', reason: 'Bug fixes detected' };
            } else {
                return { type: 'patch', reason: 'General updates' };
            }

        } catch (error) {
            console.warn('Could not analyze git commits:', error.message);
            return { type: 'patch', reason: 'Git analysis failed, defaulting to patch' };
        }
    }

    getLastTag() {
        try {
            return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
        } catch (error) {
            return null;
        }
    }

    bumpVersion(type) {
        const current = this.getCurrentVersion();
        const { major, minor, patch } = this.parseVersion(current);

        let newMajor = major;
        let newMinor = minor;
        let newPatch = patch;

        switch (type) {
            case 'major':
                newMajor += 1;
                newMinor = 0;
                newPatch = 0;
                break;
            case 'minor':
                newMinor += 1;
                newPatch = 0;
                break;
            case 'patch':
                newPatch += 1;
                break;
            default:
                throw new Error(`Unknown version type: ${type}`);
        }

        return this.formatVersion(newMajor, newMinor, newPatch);
    }

    updateVersionFiles(newVersion) {
        // Update version.ver file
        fs.writeFileSync(this.versionFile, newVersion);

        // Update package.json if it exists
        if (fs.existsSync(this.packageFile)) {
            const packageData = JSON.parse(fs.readFileSync(this.packageFile, 'utf8'));
            packageData.version = newVersion;
            fs.writeFileSync(this.packageFile, JSON.stringify(packageData, null, 2));
        }

        console.log(`✅ Version updated to ${newVersion}`);
    }

    createGitTag(version, message) {
        try {
            execSync(`git tag -a v${version} -m "${message}"`);
            console.log(`✅ Git tag v${version} created`);
        } catch (error) {
            console.warn('Could not create git tag:', error.message);
        }
    }

    autoVersion() {
        const analysis = this.analyzeCommitMessages();
        
        if (analysis.type === 'none') {
            console.log('No version bump needed - no new commits');
            return;
        }

        const currentVersion = this.getCurrentVersion();
        const newVersion = this.bumpVersion(analysis.type);

        console.log(`\n📦 Version Update Summary:`);
        console.log(`   Current: ${currentVersion}`);
        console.log(`   New:     ${newVersion}`);
        console.log(`   Type:    ${analysis.type.toUpperCase()}`);
        console.log(`   Reason:  ${analysis.reason}\n`);

        this.updateVersionFiles(newVersion);
        this.createGitTag(newVersion, `${analysis.type}: ${analysis.reason}`);

        return newVersion;
    }

    manualVersion(type) {
        const currentVersion = this.getCurrentVersion();
        const newVersion = this.bumpVersion(type);

        console.log(`\n📦 Manual Version Update:`);
        console.log(`   Current: ${currentVersion}`);
        console.log(`   New:     ${newVersion}`);
        console.log(`   Type:    ${type.toUpperCase()}\n`);

        this.updateVersionFiles(newVersion);
        this.createGitTag(newVersion, `Manual ${type} version bump`);

        return newVersion;
    }
}

// CLI Usage
if (require.main === module) {
    const versionManager = new VersionManager();
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Auto-detect version bump
        versionManager.autoVersion();
    } else if (args[0] === 'current') {
        console.log(versionManager.getCurrentVersion());
    } else if (['major', 'minor', 'patch'].includes(args[0])) {
        versionManager.manualVersion(args[0]);
    } else {
        console.log(`
Usage:
  node version-manager.js          # Auto-detect version bump from commits
  node version-manager.js current  # Show current version
  node version-manager.js major    # Manual major version bump
  node version-manager.js minor    # Manual minor version bump
  node version-manager.js patch    # Manual patch version bump
        `);
    }
}

module.exports = VersionManager;
