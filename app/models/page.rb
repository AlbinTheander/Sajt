class Page < ActiveRecord::Base

  def self.save(upload_file)
    name = upload_file.original_filename
    logger.error "Name" + name
    directory="public/pics"
    path = File.join(directory, name)
    File.open(path, "wb")  do |f|
      f.write(upload_file.read)
    end
  end
end
