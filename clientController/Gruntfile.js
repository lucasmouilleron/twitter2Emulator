module.exports = function(grunt) {

  /////////////////////////////////////////////////////////////////////////
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    cfg: grunt.file.readJSON("config/config.json"),
    dbDistDir:"dist/db",
    dbConstantURL:"[__ROOT_URL__]",
    availabletasks: {
      tasks: {
        options: {
          sort: false,
          filter: "include",
          tasks: ["default", "env:init","db:backup","db:restore","watch:all","compile:all","watch:scripts", "compile:scripts", "compile:styles", "watch:styles", "browser:sync"]
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: "<%=cfg.jsDir%>",
          mainConfigFile: "<%=cfg.jsMainFile%>",
          name: "<%=cfg.jsMainName%>",
          out: "<%=cfg.jsMinFile%>"
        }
      }
    },
    compass: {
      compile: {
        options: {
          httpPath: "<%=cfg.baseURL%>",
          sassDir: "<%=cfg.sassDir%>",
          cssDir: "<%=cfg.cssDir%>",
          imagesDir: "<%=cfg.imgDir%>",
          fontsDir: "<%=cfg.fontsDir%>",
          httpStylesheetsPath:"<%=cfg.cssDir%>",
          cacheDir: "<%=cfg.sassDir%>/.sass-cache",
          outputStyle:"compressed",
          relativeAssets:true,
          lineComments:false,
          raw: "preferred_syntax = :sass\n",
          environment: "production"
        }
      }
    },
    watch: {
      js: {
        files: ["<%=cfg.jsDir%>/**/*.js"],
        tasks: ["requirejs:compile"]
      },
      sass: {
        files: ["<%=cfg.sassDir%>/**/*.scss"],
        tasks: ["compass:compile"]
      },
      everything: {
        files: ["<%=cfg.sassDir%>/**/*.scss", "<%=cfg.jsDir%>/**/*.js"],
        tasks: ["compass:compile", "requirejs:compile"]
      }
    },
    browserSync: {
      dev: {
        bsFiles: {
          src : ["<%=cfg.cssDir%>/**/*.css", "<%=cfg.webDir%>/**/*.php", "<%=cfg.webDir%>/**/*.html"]
        },
        options: {
          host: "<%=cfg.host%>",
          proxy: "http://<%=cfg.host%>/<%=cfg.baseURL%>/"
        }
      }
    },
    exec: {
      dbBackup: {
        cmd: "<%=cfg.mysqldumpPath%> --delayed-insert --skip-extended-insert -h <%=cfg.dbHost%> -u <%=cfg.dbUser%> --password=<%=cfg.dbPass%> <%=cfg.dbName%> --result-file=<%=dbDistDir%>/<%=pkg.name%>.sql",
        stderr: false
      },
      dbRestore: {
        cmd: "<%=cfg.mysqlPath%> --user=<%=cfg.dbUser%> --password=<%=cfg.dbPass%> -h <%=cfg.dbHost%> <%=cfg.dbName%> < <%=dbDistDir%>/<%=pkg.name%>.sql",
        stderr: false
      }
    },
    replace: {
      dbBackup: {
        src: ["<%=dbDistDir%>/<%=pkg.name%>.sql"],
        overwrite: true,
        replacements: [{
          from: "<%=cfg.homeURL%>",
          to: "<%=dbConstantURL%>",
        }]
      },
      dbRestore: {
        src: ["<%=dbDistDir%>/<%=pkg.name%>.sql"],
        overwrite: true,
        replacements: [{
          from: "<%=dbConstantURL%>",
          to: "<%=cfg.homeURL%>"
        }]
      },
      initFiles: {
        src: ["web/wp-config.php", "web/.htaccess"],
        overwrite: true,
        replacements: [{
          from: "{dc:baseURL}",
          to: "<%=cfg.baseURL%>"
        },{
          from: "{dc:homeURL}",
          to: "<%=cfg.homeURL%>"
        },{
          from: "{dc:dbHost}",
          to: "<%=cfg.dbHost%>"
        },{
          from: "{dc:dbUser}",
          to: "<%=cfg.dbUser%>"
        },{
          from: "{dc:dbPass}",
          to: "<%=cfg.dbPass%>"
        },{
          from: "{dc:dbName}",
          to: "<%=cfg.dbHost%>"
        }]
      }
    },
    copy: {
      initFiles : {
        files: [{
          src: "web/sample.wp-config.php",
          dest: "web/wp-config.php"
        },
        {
          src: "web/sample.htaccess",
          dest: "web/.htaccess"
        }]
      }
    }
  });

  /////////////////////////////////////////////////////////////////////////
  grunt.loadNpmTasks("grunt-available-tasks");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-contrib-compass");
  grunt.loadNpmTasks("grunt-browser-sync");
  grunt.loadNpmTasks("grunt-exec");
  grunt.loadNpmTasks("grunt-text-replace");
  grunt.loadNpmTasks("grunt-contrib-copy");
  /////////////////////////////////////////////////////////////////////////
  grunt.registerTask("default", "These help instructions",["availabletasks"]);
  grunt.registerTask("watch:scripts", "Watch and compile js files",["watch:js"]);
  grunt.registerTask("compile:scripts", "Compile js files",["requirejs:compile"]);
  grunt.registerTask("watch:styles", "Compile sass files",["watch:sass"]);
  grunt.registerTask("compile:styles", "Watch and compile sass files",["compass:compile"]);
  grunt.registerTask("watch:all", "Compile all",["watch:everything"]);
  grunt.registerTask("compile:all", "Watch and compile all",["compile:styles","compile:scripts"]);
  grunt.registerTask("browser:sync", "Sync browser",["browserSync:dev"]);
  grunt.registerTask("db:backup", "Backup current database to a .sql file",["exec:dbBackup", "replace:dbBackup"]);
  grunt.registerTask("db:restore", "Restore currently backuped database", ["replace:dbRestore","exec:dbRestore","replace:dbBackup"]);
  grunt.registerTask("env:init", "Initialize project files for working environment",["copy:initFiles","replace:initFiles"]);

};