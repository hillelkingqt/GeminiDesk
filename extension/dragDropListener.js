(function () {
  // Avoid multiple listener registration
  if (window.__mcpDragListener) return;
  window.__mcpDragListener = true;

  window.addEventListener('message', async event => {
    if (event.source !== window || !event.data || event.data.type !== 'MCP_DROP_FILE') return;
    let file, fileName, fileType, lastModified, randomText;
    if (event.data.fileData) {
      // Use posted file
      fileName = event.data.fileName;
      fileType = event.data.fileType;
      lastModified = event.data.lastModified;
      const blob = await fetch(event.data.fileData).then(res => res.blob());
      file = new File([blob], fileName, { type: fileType, lastModified });
      randomText = null;
    }
    // else {
    //   // Fallback: generate random file as in reference
    //   const timestamp = new Date().toISOString();
    //   const randomId = Math.random().toString(36).substring(2, 15);
    //   randomText = `Random Text File\n------------------\nCreated: ${timestamp}\nID: ${randomId}\nContent: This is sample text content for testing purposes.\nThe random seed value is: ${Math.random().toFixed(6)}\n\nAdditional lines of random text:\n${Array(5).fill(0).map(() => Math.random().toString(36).substring(2)).join('\\n')}`;
    //   const blob = new Blob([randomText], { type: 'text/plain' });
    //   fileName = `random_text_${Date.now()}.txt`;
    //   file = new File([blob], fileName, { type: 'text/plain', lastModified: Date.now() });
    // }
    // Target the drop zone with multiple fallback selectors
    const dropZone =
      document.querySelector('div[xapfileselectordropzone]') ||
      document.querySelector('.text-input-field') ||
      document.querySelector('.input-area') ||
      document.querySelector('.ql-editor');
    if (!dropZone) {
      console.error('Drop zone not found using any of the selectors');
      return;
    }
    console.log(`Found drop zone: ${dropZone.className}`);
    // Create a more complete DataTransfer-like object
    const dataTransfer = {
      files: [file],
      types: ['Files', 'application/x-moz-file'],
      items: [
        {
          kind: 'file',
          type: file.type,
          getAsFile: function () {
            return file;
          },
        },
      ],
      getData: function (format) {
        if (format && format.toLowerCase() === 'text/plain' && randomText) return randomText;
        return '';
      },
      setData: function () {},
      clearData: function () {},
      dropEffect: 'copy',
      effectAllowed: 'copyMove',
    };
    // Create more complete drag events sequence
    const dragEnterEvent = new Event('dragenter', { bubbles: true, cancelable: true });
    const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
    const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
    // Attach dataTransfer to all events
    [dragEnterEvent, dragOverEvent, dropEvent].forEach(event => {
      Object.defineProperty(event, 'dataTransfer', {
        value: dataTransfer,
        writable: false,
      });
    });
    // Simulate preventDefault() calls that would happen in a real drag
    dragOverEvent.preventDefault = function () {
      console.log('dragover preventDefault called');
      Event.prototype.preventDefault.call(this);
    };
    dropEvent.preventDefault = function () {
      console.log('drop preventDefault called');
      Event.prototype.preventDefault.call(this);
    };
    // Complete drag simulation sequence
    console.log('Starting drag simulation sequence');
    console.log('1. Dispatching dragenter event');
    dropZone.dispatchEvent(dragEnterEvent);
    console.log('2. Dispatching dragover event');
    dropZone.dispatchEvent(dragOverEvent);
    console.log('3. Dispatching drop event');
    dropZone.dispatchEvent(dropEvent);
    console.log('Drag and drop simulation completed successfully');
    // Validate the operation worked by checking for file preview element
    // setTimeout(() => {
    //   const filePreview = document.querySelector('.file-preview');
    //   if (filePreview) {
    //     console.log('Success: File preview element found in DOM');
    //   } else {
    //     console.warn('Note: File preview element not found in DOM. The operation might still have worked.');
    //   }
    // }, 1000);
  });
})();
