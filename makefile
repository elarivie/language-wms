APM=apm

THENAME :="language-wms"

gitcommit:
	- git commit -m "WIP"
atomPublishMajor: gitcommit
	${APM} publish major
atomPublishMinor: gitcommit
	${APM} publish minor
atomPublishPatch: gitcommit
	${APM} publish patch
atomPublishBuild: gitcommit
	${APM} publish build

develop:
	${APM} develop ${THENAME}
	${ATOM} -d ~/.atom/dev/packages/${THENAME}
