; Additions to the Windows installer that electron-builder makes.
; Declare the installer DPI-aware, so Windows draws it sharply on high-resolution screens instead of
; stretching a low-resolution picture of it (which looks blurry).
!macro customHeader
  ManifestDPIAware true
!macroend
