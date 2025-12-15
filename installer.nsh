!macro customInstall
  ; Add custom installation logic here if needed
  ; Write installation path to registry for proper app registration
  ; PRODUCT_NAME is defined by electron-builder during build
  WriteRegStr HKCU "Software\GeminiDesk" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\GeminiDesk" "Version" "${VERSION}"
!macroend

!macro customUnInstall
  ; Clean up registry entries
  DeleteRegKey HKCU "Software\GeminiDesk"
!macroend
