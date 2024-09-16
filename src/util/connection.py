import posixpath
import os
import yaml

from abc import ABC, abstractmethod
from pydrive2.fs import GDriveFileSystem
from typing import Iterable


class DataConnection(ABC):
    """Class representing a connection to the dataset containing all the runs."""

    @abstractmethod
    def parse_yaml(self, path: str) -> dict:
        """Open the yaml file at a given relative path, and parse it into a Python dict"""

    @abstractmethod
    def exists(self, path: str) -> bool:
        """See if a file at a path exists"""

    @abstractmethod
    def list_dirs(self, path: str) -> Iterable[str]:
        """List all directories at a certain path"""

    @abstractmethod
    def list_files(self, path: str) -> Iterable[str]:
        """List all files at a certain path"""


class LocalFilesystem(DataConnection):
    def __init__(self, top: str = "./metadata"):
        # Top level directory
        self.top = top

    def parse_yaml(self, path: str) -> dict:
        with open(posixpath.join(self.top, path), "r") as file:
            return yaml.safe_load(file)

    def exists(self, path: str) -> bool:
        return os.path.exists(posixpath.join(self.top, path))

    def list_dirs(self, path: str) -> Iterable[str]:
        return next(os.walk(posixpath.join(self.top, path)))[1]

    def list_files(self, path: str) -> Iterable[str]:
        return next(os.walk(posixpath.join(self.top, path)))[2]


class GoogleDrive(DataConnection):
    def __init__(self, root_id: str = "1Di3w5_sOm-Ewv5Smklt9pFWXHY96rEah"):
        self.root_id = root_id
        self.fs = GDriveFileSystem(
            root_id, use_service_account=True, client_json_file_path="./secrets.json"
        )

    def parse_yaml(self, path: str) -> dict:
        path = os.path.normpath(posixpath.join(self.root_id, path))
        with self.fs.open(path, "r") as file:
            return yaml.safe_load(file)

    def exists(self, path: str) -> bool:
        path = os.path.normpath(posixpath.join(self.root_id, path))
        return self.fs.exists(path)

    def list_dirs(self, path: str) -> Iterable[str]:
        path = os.path.normpath(posixpath.join(self.root_id, path))
        return next(self.fs.walk(path))[1]

    def list_files(self, path: str) -> Iterable[str]:
        path = os.path.normpath(posixpath.join(self.root_id, path))
        return next(self.fs.walk(path))[2]
