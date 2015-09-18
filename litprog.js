#!/usr/bin/env node

var recursively = false;
var html = false;
var ext = null;
var help = false;
var source_path = null;

for (var i = 2; i <process.argv.length; i++) {
    var arg = process.argv[i];
    switch (arg) {
      case "-r": {
        recursively = true;
        break;
        }
      case "-html": {
        html = true;
        break;
        }
      case "-h": {
        help = true;
        break;
        }
      case "-ext": {
        ext = process.argv[i+1];
        i++;
        break;
        }
      default: {
        source_path = arg;
        }
    }
}

if (source_path == null || ext == null || help == true) {
  console.log("\nlitprog options source_path -ext lang_extension\n\nThis program defaults at generating the source code of a single Markdown file.\nTo change that behaviour, use the different options.\n\nOptions\n\n-html : Generate the source code from an html document.\n-r : Recursively generate all the files of the specified directory that end in '.md' or '.html'.\n-h : Show this help page.\n");
process.exit(0);
}
var cheerio = require('cheerio');

function extract_markdown_from_html(cheerio,file) {
  var $ = cheerio.load(file);
  var documentation = "";
  $("div.markdown").each(function(){
    documentation += $(this).text();
  });
  return documentation;
}
function extract_code_from_markdown(markdown) {
  var code = "";
  var temp = markdown.split("\`\`\`\n");
  for(var i = 1; i < temp.length; i = i+2) {
    code +=temp[i]; 
  }
  return code;
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
function extract_single_file(path,html,ext) {

  var is_html = path.slice(-4) == "html";
  var is_md = path.slice(-2) == "md";
  if((html !=is_html) || !(is_html || is_md)) {
    return;
  } else {
    var file = load_file(path);
    var markdown;
    var path_to_save;
    if(html) {
      path_to_save = path.slice(0,-5);
      markdown = extract_markdown_from_html(cheerio,file); 
    } else {
      path_to_save = path.slice(0,-3);
      markdown = file;
    }

    var code = extract_code_from_markdown(markdown);
    fs.writeFileSync(path_to_save + ext,code);
  }
}

if(recursively) {
  function dir_rec(cpath) {
    var files = fs.readdirSync(cpath);
    files.forEach(function(file){
      var stat = fs.statSync(cpath + "/" + file);
      if(stat.isDirectory()) {
        dir_rec(cpath + "/" + file);
      } else {
        extract_single_file(source_path,html,ext);
      }
    });
  }
  dir_rec(source_path);
} else {
  extract_single_file(source_path,html,ext);
}
