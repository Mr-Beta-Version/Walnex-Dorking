const go = (q) => `https://www.google.com/search?q=${q}`;

const dorkCategories = [
  {
    id: "directory-listing",
    name: "Directory Listing",
    description: "Find open directory listings on the target",
    url: (d) => go(`site:${d} intitle:index.of`),
    tags: ["recon", "exposure"],
  },
  {
    id: "config-files",
    name: "Config Files",
    description: "Search for exposed configuration files",
    url: (d) =>
      go(`site:${d} ext:xml | ext:conf | ext:cnf | ext:reg | ext:inf | ext:rdp | ext:cfg | ext:txt | ext:ora | ext:ini`),
    tags: ["sensitive", "config"],
  },
  {
    id: "database-files",
    name: "Database Files",
    description: "Find exposed database files",
    url: (d) => go(`site:${d} ext:sql | ext:dbf | ext:mdb`),
    tags: ["sensitive", "database"],
  },
  {
    id: "wordpress",
    name: "WordPress",
    description: "Discover WordPress-related paths and files",
    url: (d) =>
      go(`site:${d} inurl:wp- | inurl:wp-content | inurl:plugins | inurl:uploads | inurl:themes | inurl:download`),
    tags: ["cms", "wordpress"],
  },
  {
    id: "log-files",
    name: "Log Files",
    description: "Search for exposed log files",
    url: (d) => go(`site:${d} ext:log`),
    tags: ["sensitive", "logs"],
  },
  {
    id: "backup-files",
    name: "Backup/Old Files",
    description: "Find backup and old files that may contain sensitive data",
    url: (d) => go(`site:${d} ext:bkf | ext:bkp | ext:bak | ext:old | ext:backup`),
    tags: ["sensitive", "backup"],
  },
  {
    id: "login-pages",
    name: "Login Pages",
    description: "Discover login and authentication pages",
    url: (d) =>
      go(`site:${d} inurl:login | inurl:signin | intitle:Login | intitle:signin | inurl:auth`),
    tags: ["auth", "login"],
  },
  {
    id: "sql-errors",
    name: "SQL Errors",
    description: "Find pages with SQL error messages",
    url: (d) =>
      go(`site:${d} intext:"sql syntax near" | intext:"syntax error has occurred" | intext:"incorrect syntax near" | intext:"unexpected end of SQL command" | intext:"Warning: mysql_connect()" | intext:"Warning: mysql_query()" | intext:"Warning: pg_connect()"`),
    tags: ["sqli", "vulnerability"],
  },
  {
    id: "exposed-docs",
    name: "Exposed Docs",
    description: "Find exposed documents (PDF, DOC, XLS, etc.)",
    url: (d) =>
      go(`site:${d} ext:doc | ext:docx | ext:odt | ext:pdf | ext:rtf | ext:sxw | ext:psw | ext:ppt | ext:pptx | ext:pps | ext:csv`),
    tags: ["documents", "exposure"],
  },
  {
    id: "phpinfo",
    name: "phpinfo()",
    description: "Find exposed phpinfo pages",
    url: (d) =>
      go(`site:${d} ext:php intitle:phpinfo "published by the PHP Group"`),
    tags: ["php", "exposure"],
  },
  {
    id: "backdoor",
    name: "Find Backdoor",
    description: "Search for potential backdoors and shells",
    url: (d) =>
      go(`site:${d} inurl:shell | inurl:backdoor | inurl:wso | inurl:cmd | shadow | passwd | boot.ini | inurl:backdoor`),
    tags: ["malware", "backdoor"],
  },
  {
    id: "open-redirect",
    name: "Open Redirect",
    description: "Find potential open redirect vulnerabilities",
    url: (d) =>
      go(`site:${d} inurl:redir | inurl:url | inurl:redirect | inurl:return | inurl:src=http | inurl:r=http`),
    tags: ["redirect", "vulnerability"],
  },
  {
    id: "third-party",
    name: "3rd Party Exposure",
    description: "Search third-party sites for target exposure",
    url: (d) =>
      go(`site:http://ideone.com | site:http://codebeautify.org | site:http://codeshare.io | site:http://codepen.io | site:http://repl.it | site:http://justpaste.it | site:http://pastebin.com | site:http://jsfiddle.net | site:http://trello.com | site:*.atlassian.net | site:bitbucket.org "${d}"`),
    tags: ["exposure", "third-party"],
  },
  {
    id: "pastebin",
    name: "Find in Pastebin",
    description: "Search Pastebin for mentions of the target",
    url: (d) => go(`site:pastebin.com "${d}"`),
    tags: ["exposure", "pastebin"],
  },
  {
    id: "crt-sh",
    name: "Subdomains (crt.sh)",
    description: "Find subdomains via certificate transparency logs",
    url: (d) => `https://crt.sh/?q=${d}`,
    tags: ["subdomain", "recon"],
  },
  {
    id: "wordpress-2",
    name: "Find WordPress #2",
    description: "Alternative WordPress discovery dork",
    url: (d) => go(`site:${d} inurl:wp-content | inurl:wp-includes`),
    tags: ["cms", "wordpress"],
  },
  {
    id: "bitbucket",
    name: "Bitbucket/Atlassian",
    description: "Search Bitbucket and Atlassian for target",
    url: (d) => go(`site:atlassian.net | site:bitbucket.org "${d}"`),
    tags: ["code", "exposure"],
  },
  {
    id: "stackoverflow",
    name: "StackOverflow",
    description: "Search StackOverflow for target mentions",
    url: (d) => go(`site:stackoverflow.com "${d}"`),
    tags: ["code", "exposure"],
  },
  {
    id: "wayback",
    name: "All Wayback URLs",
    description: "Find all archived URLs for the target",
    url: (d) =>
      `https://web.archive.org/cdx/search/cdx?url=${d}/*&output=text&fl=original&collapse=urlkey`,
    tags: ["recon", "archive"],
  },
  {
    id: "github",
    name: "Search in GitHub",
    description: "Search GitHub for target mentions",
    url: (d) => `https://github.com/search?q="${d}"`,
    tags: ["code", "exposure"],
  },
  {
    id: "openbugbounty",
    name: "OpenBugBounty",
    description: "Search OpenBugBounty for known vulnerabilities",
    url: (d) =>
      `https://www.openbugbounty.org/search/?search=${d}`,
    tags: ["vulnerability", "bounty"],
  },
  {
    id: "git-folder",
    name: ".git Folder",
    description: "Find exposed .git directories",
    url: (d) => go(`inurl:"/.git" ${d} -github`),
    tags: ["sensitive", "git"],
  },
  {
    id: "swf-files",
    name: "Find .swf (Google)",
    description: "Find Flash (SWF) files on the target",
    url: (d) => go(`site:${d} ext:swf`),
    tags: ["files", "flash"],
  },
  {
    id: "s3-buckets",
    name: "S3 Buckets",
    description: "Find exposed Amazon S3 buckets",
    url: (d) => go(`site:.s3.amazonaws.com "${d}"`),
    tags: ["cloud", "aws"],
  },
  {
    id: "shodan",
    name: "Shodan Search",
    description: "Search Shodan for the target",
    url: (d) => `https://www.shodan.io/search?query=${d}`,
    tags: ["recon", "infrastructure"],
  },
  {
    id: "api-wsdl",
    name: "API (WSDL)",
    description: "Find exposed WSDL/API definition files",
    url: (d) =>
      go(`site:${d} filetype:wsdl | filetype:WSDL | ext:svc | inurl:wsdl | Filetype:?wsdl | inurl:asmx?wsdl | inurl:jws?wsdl | intitle:_vti_bin/sites.asmx?wsdl | inurl:_vti_bin/sites.asmx?wsdl`),
    tags: ["api", "wsdl"],
  },
  {
    id: "gist-github",
    name: "GIST GitHub Search",
    description: "Search GitHub Gists for target",
    url: (d) => `https://gist.github.com/search?q=${d}`,
    tags: ["code", "exposure"],
  },
  {
    id: "apache-config",
    name: "Apache Config Files",
    description: "Find exposed Apache configuration files",
    url: (d) => go(`site:${d} filetype:config "apache"`),
    tags: ["config", "apache"],
  },
  {
    id: "install-setup",
    name: "Install/Setup Files",
    description: "Find installation and setup files",
    url: (d) =>
      go(`site:${d} inurl:readme | inurl:license | inurl:install | inurl:setup | inurl:config`),
    tags: ["config", "setup"],
  },
  {
    id: "struts-rce",
    name: "Apache Struts RCE",
    description: "Find Apache Struts endpoints (potential RCE)",
    url: (d) => go(`site:${d} ext:action | ext:struts | ext:do`),
    tags: ["vulnerability", "rce"],
  },
  {
    id: "htaccess",
    name: ".htaccess/phpinfo()",
    description: "Find exposed .htaccess and phpinfo files",
    url: (d) => go(`site:${d} inurl:"/phpinfo.php" | inurl:".htaccess"`),
    tags: ["sensitive", "config"],
  },
  {
    id: "security-headers",
    name: "Security Headers",
    description: "Check security headers of the target",
    url: (d) => `https://securityheaders.com/?q=${d}&followRedirects=on`,
    tags: ["headers", "security"],
  },
  {
    id: "source-code",
    name: "Source Code (PublicWWW)",
    description: "Search PublicWWW for target source code",
    url: (d) => `https://publicwww.com/websites/"${d}"/`,
    tags: ["code", "source"],
  },
  {
    id: "gitlab-github",
    name: "Search GitLab & GitHub",
    description: "Search GitLab and GitHub for target",
    url: (d) => go(`site:github.com | site:gitlab.com "${d}"`),
    tags: ["code", "exposure"],
  },
  {
    id: "wayback-php",
    name: "Find .php (WayBack)",
    description: "Find PHP files in Wayback Machine",
    url: (d) =>
      `https://web.archive.org/cdx/search?url=${d}&matchType=domain&collapse=urlkey&output=text&fl=original&filter=urlkey:.*php&limit=100000`,
    tags: ["recon", "archive"],
  },
  {
    id: "subdomains-google",
    name: "Find Subdomains (Google)",
    description: "Find subdomains via Google search",
    url: (d) => go(`site:*.${d} -site:www.${d}`),
    tags: ["subdomain", "recon"],
  },
  {
    id: "digitalocean",
    name: "Digital Ocean Space",
    description: "Find exposed DigitalOcean Spaces",
    url: (d) => go(`site:digitaloceanspaces.com "${d}"`),
    tags: ["cloud", "storage"],
  },
  {
    id: "sub-subdomains",
    name: "Sub-Subdomains (Google)",
    description: "Find nested subdomains via Google",
    url: (d) => go(`site:*.*.${d}`),
    tags: ["subdomain", "recon"],
  },
  {
    id: "sensitive-wayback",
    name: "Sensitive Files (WayBack)",
    description: "Find sensitive files in Wayback Machine archive",
    url: (d) =>
      `https://web.archive.org/cdx/search/cdx?url=${d}/*&collapse=urlkey&output=text&fl=original&filter=original:.*\\\\.(xls|xml|xlsx|json|pdf|sql|doc|docx|pptx|txt|git|zip|tar.gz|tgz|bak|7z|rar|log|cache|secret|db|backup|yml|gz|config|csv|yaml|md|md5|exe|dll|bin|ini|bat|sh|tar|deb|rpm|iso|img|env|apk|msi|dmg|tmp|crt|pem|key|pub|asc)`,
    tags: ["sensitive", "archive"],
  },
  {
    id: "swagger",
    name: "Swagger API Explorer",
    description: "Find exposed Swagger/API documentation",
    url: (d) =>
      go(`site:${d} inurl:apidocs | inurl:api-docs | inurl:swagger | inurl:api-explorer`),
    tags: ["api", "documentation"],
  },
  {
    id: "form-finder-text",
    name: "Form Finder (intext)",
    description: "Find forms via text content matching",
    url: (d) =>
      go(`site:${d} intext:"first name" | intext:firstname | intext:submit | intext:contact | intext:"Is this article helpful" | intext:feedback | intext:"Demo Request"`),
    tags: ["forms", "xss"],
  },
  {
    id: "form-finder-title",
    name: "Form Finder (intitle)",
    description: "Find forms via page title matching",
    url: (d) =>
      go(`site:${d} intitle:submit | intitle:contact | intitle:submit | intitle:feedback | intitle:survey | intitle:form | intitle:"fill up"`),
    tags: ["forms", "xss"],
  },
  {
    id: "form-finder-url",
    name: "Form Finder (inurl)",
    description: "Find forms via URL pattern matching",
    url: (d) => go(`site:${d} inurl:contact | inurl:feedback | inurl:survey | inurl:form`),
    tags: ["forms", "xss"],
  },
  {
    id: "register-signup",
    name: "Register/Signup",
    description: "Find registration and signup pages",
    url: (d) =>
      go(`site:${d} intitle:signup | intitle:register | intext:signup | intext:"sign up" | intext:register | intext:username | inurl:signup | inurl:register`),
    tags: ["auth", "registration"],
  },
  {
    id: "contact-us",
    name: "Contact Us",
    description: "Find contact pages and forms",
    url: (d) => go(`site:${d} intitle:contact | intext:"contact us" | intext:survey | intitle:survey`),
    tags: ["forms", "contact"],
  },
];