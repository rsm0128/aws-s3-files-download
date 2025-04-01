# AWS S3 File Downloader

This project provides a simple utility to download all files from an AWS S3 bucket. It includes a feature to skip the first N files, which is useful for resuming downloads after a prior interruption.

## Features

- Download all files from an S3 bucket.
- Skip the first N files using the `skipFirstNFiles` parameter to resume downloads.

## Prerequisites

- AWS account with S3 service enabled.
- AWS CLI installed and configured.
- Node.js installed.

## Installation

Clone the repository:

```bash
git clone https://github.com/rsm0128/aws-s3-files-download.git
cd aws-s3-files-download
```

Install dependencies:

```bash
npm install
```

## Usage

### Download All Files

- Run the server by running the following command.
```bash
node server.js
```
- Visit http://localhost:3000 on your browser to download all files.
- All files will be downloaded in the downloads directory.
