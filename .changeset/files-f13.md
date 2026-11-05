---
'@oito2/ui-files': minor
---

Add the file components. `@oito2/ui-files` gets `FileUploadController` (accepted types, size and count limits, refusals with `FileRejection`), `FileDropZone`, `FileUpload` (refusal messages, file list with sizes, image previews and remove buttons), `DownloadTrigger` and `Downloads`, on a `FilesAdapter` chosen with `defaultFilesAdapter()`: `webFilesAdapter` (file input, HTML drag and drop, `Blob` download) in a browser and `tauriFilesAdapter` (dialog and fs plugins, the webview's drag and drop events) inside Tauri. Tauri apps register `tauri-plugin-dialog` and `tauri-plugin-fs` and grant `dialog:allow-open`, `dialog:allow-save`, `fs:allow-stat`, `fs:allow-read-file` and `fs:allow-write-file`.
