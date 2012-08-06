# FTP server

from pyftpdlib import ftpserver
authorizer = ftpserver.DummyAuthorizer()
authorizer.add_user("root", "", "/home/root", 
perm="elradfmw")
handler = ftpserver.FTPHandler
handler.authorizer = authorizer
address = ("", 21)
ftpd = ftpserver.FTPServer(address, handler)
ftpd.serve_forever()
