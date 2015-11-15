#!/usr/bin/env node

var recursively = false;
var html = false;
var ext = null;
var label = "";
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
      case "-lb": {
        label = " " + process.argv[i+1];
        i++;
        break;
        }
      default: {
        source_path = arg;
        }
    }
}

if (source_path == null || ext == null || help == true) {
  console.log("\litprog source_path -ext lang_extension\nThis program defaults at getting the source code from a single Markdown file.\n\nOptions\n-html : Get the source code from an html document.\n-r : Recursively get the code from all the files of the specified directory that end in '.md' or '.html'.\n-lb <string> : Only gets the code blocks that have label <string>.\n-h : Show this help page.");
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
function highlight_language_string(ext) {
  switch(ext) {
    case ".js": {
      return "javascript";
      }
    case ".rs": {
      return "rust";
      }
    default: {
      return "";
    }
  }
}

function extract_code_from_markdown(markdown,language_string,label) {
  var code = "";
  var temp = markdown.split(new RegExp("\`\`\`" + language_string + " *" + label + ".*\n"));
  for(var i = 1; i < temp.length; i++) {
    code +=temp[i].split(new RegExp("\`\`\`.*\n"))[0]; 
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
function extract_single_file(path,html,ext,language_string,label) {

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

    var code = extract_code_from_markdown(markdown,language_string,label);
    fs.writeFileSync(path_to_save + ext,code);
  }
}

var language_string = highlight_language_string(ext);

if(recursively) {
  function dir_rec(cpath) {
    var files = fs.readdirSync(cpath);
    files.forEach(function(file){
      var stat = fs.statSync(cpath + "/" + file);
      if(stat.isDirectory()) {
        dir_rec(cpath + "/" + file);
      } else {
        extract_single_file(cpath + "/" + file,html,ext,language_string,label);
      }
    });
  }
  dir_rec(source_path);
} else {
  extract_single_file(source_path,html,ext,language_string,label);
}
