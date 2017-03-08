# MYKRYPTION
Okay so from the POV of the parent folder (e.g. Cloud):

There are various [mykrypt] folders which exist only locally.
These are mykrypted into Public via mykryption.bat

All that juicy mykrypted data can then be pushed to/pulled from amazon drive via mykryption/Commands/ bat files.

So Public should be the same locally and remotely.
In future I could make it pull only certain remote stuff, and handle the push/pull within mykryption.

Passwords aren't written anywhere of course so don't bother looking lol duh, not complicated.


## NOTE
7z directly compiles the contents of each [mykrypt] folder,
so if a folder is nested within that, it goes into a single .mdata file.

Which may, or may not be ideal.. considering that updating a file within that means re-upping that entire file


## DELETING THINGS LOCALLY

If finished with or already mykrypted, and wanting to delete the original files.
Go ahead and delete anything in any [mykrypt] folder. It _should_ have a copy in Public.

## DELETING THINGS REMOTELY (AND LOCALLY)

Run mykryption and delete from within it, so as to remove from the log too.
Then run a command to mirror it on the server (although I can't imagine that's worth doing)
