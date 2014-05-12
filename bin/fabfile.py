#!/usr/bin/python
from fabric.api import *
from fabric.contrib.files import exists
import os

def rsync():
    local("rsync -avz --progress /home/hadoop/git_project_home/logsender/ %s@%s:/home/hadoop/xa/logsender/" % (env.user,env.host))

def start():
	run("pm2 start /home/hadoop/git_project_home/logsender/bin/www -i max")

def restart():
	run("pm2 dump")
	run("pm2 kill")
	run("pm2 resurect")
