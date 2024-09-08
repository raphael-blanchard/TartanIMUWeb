from pydrive2.fs import GDriveFileSystem
from util import *


print(
    list(
        filter_by_metadata(
            make_filter_for_metadata_attribute(
                "lap-info",
                "lap-times",
                custom_filter=lambda x: len(x) > 5,
            )
        )
    )
)
