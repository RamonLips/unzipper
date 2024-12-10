const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

const downloadsFolder = path.join(__dirname, 'data');
const extractedFolder = path.join(__dirname, 'extracted');
const deleteFiles = false

// Create the 'extracted' folder if it doesn't exist
if (!fs.existsSync(extractedFolder)) {
    fs.mkdirSync(extractedFolder);
}

const picturesFolder = path.join(extractedFolder, 'pictures');
const otherFilesFolder = path.join(extractedFolder, 'other_files');
const documentsFolder = path.join(extractedFolder, 'documents');
const audioFolder = path.join(extractedFolder, 'audio');
const videosFolder = path.join(extractedFolder, 'videos');

// Create the 'pictures', 'documents', 'audio', 'videos', and 'other_files' folders if they don't exist
if (!fs.existsSync(picturesFolder)) {
    fs.mkdirSync(picturesFolder);
}
if (!fs.existsSync(otherFilesFolder)) {
    fs.mkdirSync(otherFilesFolder);
}
if (!fs.existsSync(documentsFolder)) {
    fs.mkdirSync(documentsFolder);
}
if (!fs.existsSync(audioFolder)) {
    fs.mkdirSync(audioFolder);
}
if (!fs.existsSync(videosFolder)) {
    fs.mkdirSync(videosFolder);
}

const pictureExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
const audioExtensions = ['.mp3', '.wav', '.flac', '.aac'];
const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov'];

// Read all files in the downloads folder
fs.readdir(downloadsFolder, (err, files) => {
    if (err) {
        console.error('Error reading downloads folder:', err);
        return;
    }

    // Filter out the zip files
    const zipFiles = files.filter(file => path.extname(file) === '.zip');

    // Extract each zip file
    zipFiles.forEach(zipFile => {
        const zipFilePath = path.join(downloadsFolder, zipFile);

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

                if (deleteFiles) {
                    fs.unlink(zipFilePath, err => {
                        if (err) {
                            console.error(`Error deleting ${zipFile}:`, err);
                        } else {
                            console.log(`Deleted ${zipFile}`);
                        }
                    });
                }
            })
            .on('error', err => {
                console.error(`Error extracting ${zipFile}:`, err);
            });
    });
});