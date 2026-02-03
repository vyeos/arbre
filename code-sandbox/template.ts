import { Template } from "e2b";

export const template = Template()
  .fromImage("e2bdev/base")
  .runCmd("sudo apt-get update")
  .runCmd(
    "sudo apt-get install -y --no-install-recommends python3 python3-pip build-essential openjdk-17-jdk-headless golang",
  )
  .runCmd("sudo npm install -g typescript ts-node")
  .runCmd("sudo rm -rf /var/lib/apt/lists/*")
  .runCmd("echo E2B Arbre template ready");
