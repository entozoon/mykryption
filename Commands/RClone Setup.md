http://rclone.org/amazonclouddrive/

# Named 'amazon', then choose 1 and run all as default
rclone config

# Add remote folders (might not be necessary, just use copy)
rclone mkdir amazon:Foo

# Info
rclone lsd amazon:

# List files
rclone ls amazon:

# Copy - not a replace! i.e. doesn't delete files
rclone copy Public amazon:Public

# Sync
rclone copy Public amazon:Public

# Etc, see command list..


# Delete a folder
rclone purge amazon:Public



## Command list
rclone config - Enter an interactive configuration session.
rclone copy - Copy files from source to dest, skipping already copied
rclone sync - Make source and dest identical, modifying destination only.
rclone move - Move files from source to dest.
rclone delete - Remove the contents of path.
rclone purge - Remove the path and all of its contents.
rclone mkdir - Make the path if it doesn’t already exist.
rclone rmdir - Remove the path.
rclone check - Checks the files in the source and destination match.
rclone ls - List all the objects in the the path with size and path.
rclone lsd - List all directories/containers/buckets in the the path.
rclone lsl - List all the objects path with modification time, size and path.
rclone md5sum - Produces an md5sum file for all the objects in the path.
rclone sha1sum - Produces an sha1sum file for all the objects in the path.
rclone size - Returns the total size and number of objects in remote:path.
rclone version - Show the version number.
rclone cleanup - Clean up the remote if possible
