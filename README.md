# ZIP File Extraction Script

A simple and efficient **Node.js** script to extract ZIP files in bulk using <a href="https://www.npmjs.com/package/unzipper" target="_blank">unzipper</a> and organize them into sorted folders.

---

## Features
- Bulk extraction of ZIP files.
- Automatic organization into sorted folders.
- Lightweight and easy to configure.

---

## How to Use
1. Place your ZIP files in the designated input folder.
2. Install all the dependencies.
   ```npm
   npm i
   ```
4. Run the script to extract and organize the files.
   ```node
   node unzip
   ```

---

## Configuration
Customize the script behavior by editing the `.env` file:
- **DATA_FOLDER**: The path to the folder containing ZIP files.
- **EXTRACT_FOLDER**: The path to the folder where extracted files will be stored.
- **REMOVE_ORIGINAL**: To remove the original files from the data folder.

---

## Notes
- Ensure the required dependencies are installed before running the script.
- The script will automatically create output folders if they don’t exist.

---

This structure offers clear sections for different types of users, whether they need to understand the features, usage, or setup. Would you like me to incorporate this into your document?
