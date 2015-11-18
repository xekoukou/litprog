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
  console.log("\nlitprog source_path label\nThis program defaults at getting the code blocks with the specified label from a single Markdown file.\n\nOptions\n-html : Get the code blocks from an html document.\n-ar: Adds '%%%%' delimiter between code blocks.\n-h : Show this help page.");
process.exit(0);
}
var cheerio = require('cheerio');

function extract_markdown_from_html(cheerio,file) {
  var $ = cheerio.load(file);
  var documentation = "";
  $(".markdown").each(function(){
    documentation += $(this).text();
  });
  return documentation;
}
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
