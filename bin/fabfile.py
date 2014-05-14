#!/usr/bin/python
from fabric.api import *
from fabric.contrib.files import exists
import os

def deploy():
    local("rsync -avz --progress /home/hadoop/git_project_home/logsender/ %s@%s:/home/hadoop/xa/logsender/" % (env.user,env.host))

def start():
	run("sudo pm2 start /home/hadoop/xa/logsender/bin/www -i max")

def restart():
	run("sudo pm2 restart www")

def stop():
	run("sudo pm2 stop www")

def kill():
	run("sudo pm2 kill")
