# litprog

**litprog** is a tool that helps programmers put the code of the program inside the documentation. What it does is to extract code blocks from an html or md document. 

The tool can join all code blocks together or it can put `%%%%` between blocks so that other programs can split the blocks into an array and do further processing.

If one labels code blocks, then it is possible to only get the code blocks with a specific label.

```javascript
#!/usr/bin/env node

var html = false;
var label = "";
var delimiter = "";
var help = false;
var source_path = null;

for (var i = 2; i <process.argv.length; i++) {
    var arg = process.argv[i];
    switch (arg) {
      case "-html": {
        html = true;
        break;
        }
      case "-h": {
        help = true;
        break;
        }
      case "-ar": {
        delimiter = "%%%%\n";
        break;
        }
      default: {
        source_path = arg;
        if(i + 1 != process.argv.length) {
          label = process.argv[i+1];
        }
        i++;
        }
    }
}

if (source_path == null || label == "" || help == true) {
  console.log("\nlitprog source_path label\nThis program defaults at getting the code blocks with the specified label from a single Markdown file.\n\nOptions\n-html : Get the code blocks from an html document(from tags with class 'markdown').\n-ar: Adds '%%%%' delimiter between code blocks.\n-h : Show this help page.");
process.exit(0);
}
```

If it is an html document, we need to get all the parts that are markdown documentation. We get all the elements that have the 'markdown class'. We use the cheerio library for that.

```javascript
var cheerio = require('cheerio');

function extract_markdown_from_html(cheerio,file) {
  var $ = cheerio.load(file);
  var documentation = "";
  $(".markdown").each(function(){
    documentation += $(this).text();
  });
  return documentation;
}
```

We extract the code from the markdown document. We use label to give special meaning to each block. This way, we can have multiple code blocks from the same language, but they might be used for something else like tests or examples.

```javascript
function extract_code_from_markdown(markdown,label,delimiter) {
  var code_blocks = [];
  var label_regex = label.split(" ").join(" +");
  var temp = markdown.split(new RegExp("\`\`\`" + label_regex + " *\n"));
  if(label_regex == "") {
    for(var i = 1; i < temp.length; i = i + 2) {
      code_blocks.push(temp[i]);
    }
  } else {
    for(var i = 1; i < temp.length; i++) {
      code_blocks.push(temp[i].split(new RegExp("\`\`\` *\n"))[0]);
    }
  }
  return code_blocks.join(delimiter);
}
```

We load a single file and report an error if it doesn't exists.

```javascript
var fs = require("fs");
function load_file(path) {
  var file;
  try {
    file = fs.readFileSync(path, { encoding: "utf-8" });
  } catch(e) {
    console.log("The file at '"+path+"' appears to not exist.");
    process.exit(0);
  }
  return file;
}
```

The remaining code deals with the options that are passed from the command line by calling the appropriate functions.

```javascript
function extract_single_file(path,html,label,delimiter) {

  var is_html = path.slice(-4) == "html";
  var is_md = path.slice(-2) == "md";
  if((html !=is_html) || !(is_html || is_md)) {
    return;
  } else {
    var file = load_file(path);
    var markdown;
    if(html) {
      markdown = extract_markdown_from_html(cheerio,file); 
    } else {
      markdown = file;
    }

    var code = extract_code_from_markdown(markdown,label,delimiter);
    process.stdout.write(code);
  }
}

extract_single_file(source_path,html,label,delimiter);
```
