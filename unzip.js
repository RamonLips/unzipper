const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

const downloadsFolder = path.join(__dirname, process.env.DATA_FOLDER || 'data');
const extractedFolder = path.join(__dirname, process.env.EXTRACTED_FOLDER || 'extracted');
const removeSourceAfterExtraction = process.env.REMOVE_ORIGINAL

// Create the 'extracted' folder if it doesn't exist
try {
    if (!fs.existsSync(extractedFolder)) {
        fs.mkdirSync(extractedFolder);
    }
} catch (err) {
    console.error('Error creating extracted folder:', err);
    process.exit(1);
}

const picturesFolder = path.join(extractedFolder, 'pictures');
const otherFilesFolder = path.join(extractedFolder, 'other_files');
const documentsFolder = path.join(extractedFolder, 'documents');
const audioFolder = path.join(extractedFolder, 'audio');
const videosFolder = path.join(extractedFolder, 'videos');

// Create the 'pictures', 'documents', 'audio', 'videos', and 'other_files' folders if they don't exist
const folders = [picturesFolder, otherFilesFolder, documentsFolder, audioFolder, videosFolder];
folders.forEach(folder => {
    try {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    } catch (err) {
        console.error(`Error creating folder ${folder}:`, err);
        process.exit(1);
    }
});

const pictureExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
const audioExtensions = ['.mp3', '.wav', '.flac', '.aac'];
const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov'];

// Read all files in the downloads folder
fs.readdir(downloadsFolder, async (err, files) => {
    if (err) {
        console.error('Error reading downloads folder:', err);
        return;
    }

    // Filter out the zip files
    const zipFiles = files.filter(file => path.extname(file) === '.zip');

    // Extract each zip file concurrently
    try {
        await Promise.all(zipFiles.map(async zipFile => {
            const zipFilePath = path.join(downloadsFolder, zipFile);

            return new Promise((resolve, reject) => {
                fs.createReadStream(zipFilePath)
                    .pipe(unzipper.Parse())
                    .on('entry', entry => {
                        let filePath;
                        if (entry.type === 'Directory') {
                            entry.autodrain();
                        } else {
                            const ext = path.extname(entry.path).toLowerCase();
                            if (pictureExtensions.includes(ext)) {
                                filePath = path.join(picturesFolder, path.basename(entry.path));
                            } else if (documentExtensions.includes(ext)) {
                                filePath = path.join(documentsFolder, path.basename(entry.path));
                            } else if (audioExtensions.includes(ext)) {
                                filePath = path.join(audioFolder, path.basename(entry.path));
                            } else if (videoExtensions.includes(ext)) {
                                filePath = path.join(videosFolder, path.basename(entry.path));
                            } else {
                                filePath = path.join(otherFilesFolder, path.basename(entry.path));
                            }
                            entry.pipe(fs.createWriteStream(filePath));
                        }
                    })
                    .on('close', () => {
                        console.log(`Extracted ${zipFile}`);

                        if (removeSourceAfterExtraction) {
                            fs.unlink(zipFilePath, err => {
                                if (err) {
                                    console.error(`Error deleting ${zipFile}:`, err);
                                    reject(err);
                                } else {
                                    console.log(`Deleted ${zipFile}`);
                                    resolve();
                                }
                            });
                        } else {
                            resolve();
                        }
                    })
                    .on('error', err => {
                        console.error(`Error extracting ${zipFile}:`, err);
                        reject(err);
                    });
            });
        }));
    } catch (err) {
        console.error('Error during extraction process:', err);
        process.exit(1);
    }
});