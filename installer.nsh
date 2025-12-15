!macro customInstall
  ; Add custom installation logic here if needed
  ; Write installation path to registry for proper app registration
  WriteRegStr HKCU "Software\${PRODUCT_NAME}" "InstallLocation" "$INSTDIR"
!macroend

!macro customUnInstall
  ; Clean up registry entries
  DeleteRegKey HKCU "Software\${PRODUCT_NAME}"
!macroend
