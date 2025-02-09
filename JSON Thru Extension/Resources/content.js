 (function () {
   // Check if the page content is raw JSON.
   const rawText = document.body.innerText.trim();
   if (!rawText.startsWith("{") && !rawText.startsWith("[")) return;

   // Try to parse the JSON.
   let jsonData;
   try {
     jsonData = JSON.parse(rawText);
   } catch (e) {
     console.error("Error parsing JSON", e);
     return;
   }

   // Get the pretty-printed JSON text.
   const originalPlainText = JSON.stringify(jsonData, null, 2);

   // Function to perform syntax highlighting and convert URLs to clickable links.
   function syntaxHighlight(json) {
     if (typeof json !== 'string') {
       json = JSON.stringify(json, undefined, 2);
     }
     // Escape HTML special characters.
     json = json.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
     // Replace tokens with spans containing CSS classes.
     return json.replace(
       /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?\b)/g,
       function (match) {
         let cls = 'json-number';
         if (/^"/.test(match)) {
           if (/:$/.test(match)) {
             cls = 'json-key';
           } else {
             cls = 'json-string';
             // Remove the surrounding quotes for URL detection.
             const unquoted = match.slice(1, -1);
             if (/^https?:\/\/[^\s]+$/.test(unquoted)) {
               return `<span class="${cls}">"<a href="${unquoted}" target="_blank">${unquoted}</a>"</span>`;
             }
           }
         } else if (/true|false/.test(match)) {
           cls = 'json-boolean';
         } else if (/null/.test(match)) {
           cls = 'json-null';
         }
         return `<span class="${cls}">${match}</span>`;
       }
     );
   }

   // Generate the syntax-highlighted HTML.
   const originalHTML = syntaxHighlight(originalPlainText);

   // Clear the current page content.
   document.documentElement.innerHTML = "";

   // Inject CSS for themes, syntax highlighting, and the toggle button.
   const style = document.createElement("style");
   style.textContent = `
     body {
       font-family: monospace;
       margin: 0;
       padding: 0;
     }
     /* Dark mode styles */
     body.dark-mode {
       background-color: #1e1e1e;
       color: #d4d4d4;
     }
     /* Light mode styles */
     body.light-mode {
       background-color: #ffffff;
       color: #000000;
     }
     #json-output {
       white-space: pre-wrap;
       word-break: break-all;
       margin: 10px;
     }
     a {
       color: #4fc1ff;
       text-decoration: underline;
     }
     /* Syntax highlighting for dark mode */
     .json-key { color: #9cdcfe; }
     .json-string { color: #ce9178; }
     .json-number { color: #b5cea8; }
     .json-boolean { color: #569cd6; }
     .json-null { color: #569cd6; }
     /* Syntax highlighting for light mode */
     body.light-mode .json-key { color: #800080; }    /* purple */
     body.light-mode .json-string { color: #b22222; }   /* firebrick */
     body.light-mode .json-number { color: #008000; }    /* green */
     body.light-mode .json-boolean { color: #0000cd; }   /* medium blue */
     body.light-mode .json-null { color: #0000cd; }
     /* Toggle button styling with a rounded square design */
     #mode-toggle {
       position: fixed;
       top: 10px;
       right: 10px;
       z-index: 1000;
       padding: 5px 10px;
       font-size: 18px;
       cursor: pointer;
       background: rgba(0, 0, 0, 0.5);
       border: none;
       outline: none;
       border-radius: 8px;
       color: #ffffff;
       transition: background 0.3s;
     }
     /* For light mode, adjust the toggle button’s appearance */
     body.light-mode #mode-toggle {
       background: rgba(200, 200, 200, 0.8);
       color: #000000;
     }
   `;
   document.head.appendChild(style);

   // Set the default theme to dark mode.
   document.body.classList.add("dark-mode");

   // Create the toggle button for dark/light mode.
   const toggleButton = document.createElement("button");
   toggleButton.id = "mode-toggle";
   // In dark mode, display the moon icon (🌙) to indicate the current dark mode.
   toggleButton.textContent = "🌙";
   document.body.appendChild(toggleButton);

   // Toggle the theme on button click.
   let isDarkMode = true;
   toggleButton.addEventListener("click", () => {
     if (isDarkMode) {
       document.body.classList.remove("dark-mode");
       document.body.classList.add("light-mode");
       // In light mode, display the sun icon (☀️) to indicate the current light mode.
       toggleButton.textContent = "☀️";
       isDarkMode = false;
     } else {
       document.body.classList.remove("light-mode");
       document.body.classList.add("dark-mode");
       // In dark mode, display the moon icon (🌙).
       toggleButton.textContent = "🌙";
       isDarkMode = true;
     }
   });

   // Create the <pre> element to display the formatted JSON.
   const pre = document.createElement("pre");
   pre.id = "json-output";
   pre.innerHTML = originalHTML;
   document.body.appendChild(pre);
 })();
