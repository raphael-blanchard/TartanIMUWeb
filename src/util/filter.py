import operator

from typing import Callable, Iterable, Sequence

from .connection import DataConnection, LocalFilesystem, GoogleDrive

# NOTE: LocalFilesystem will only work properly on Linux machines
DEFAULT_CONN = GoogleDrive()


def list_runs(conn: DataConnection = DEFAULT_CONN) -> Iterable[str]:
    # See if directories contain metadata.yaml
    return [d for d in conn.list_dirs(".") if conn.exists(f"{d}/metadata.yaml")]


def filter_by_metadata(
    filter_func: Callable[[dict], bool], conn: DataConnection = DEFAULT_CONN
) -> Iterable[str]:
    for d in conn.list_dirs("."):
        try:
            if filter_func(conn.parse_yaml(f"{d}/metadata.yaml")):
                yield d
        except Exception as e:
            print(e)


def combine_metadata_filters(
    filters: Sequence[Callable[[dict], bool]],
    every: bool = True,
) -> Callable[[dict], bool]:
    """Combines many metadata filters into one."""
    combine_func = all if every else any
    return lambda metadata: combine_func((f(metadata) for f in filters))


def make_filter_for_metadata_attribute(
    *attributes: str,
    transform: Callable[[any], any] = None,
    exact_value: any = None,
    within_range: tuple[any, any] | None = None,
    range_inclusive: tuple[bool, bool] = (True, True),
    value_set: set[any] | None = None,
    custom_filter: Callable[[any], bool] | None = None,
) -> Callable[[dict], bool]:
    """Returns a function that filters metadata by a certain YAML attribute.
    This filter can be one of 3 forms:
    1. Filter by requiring the attribute to be an exact value.
    Pass in the `exact_value` field
    2. Filter by requiring the attribute to be within a certain range.
    Pass in the `within_range` for the range, using `None` to denote no comparison at each end,
    i.e, no lower/upper bound. Pass in `range_inclusive` to specify an inclusive/exclusive comparison at each end.
    3. Filter by requiring the attribute to be one of many values.
    Pass in the `value_set` to specify those values.
    4. Some other custom filter. Pass in a `custom_filter` function.
    """

    def attribute_filter(metadata: dict) -> bool:
        for attr in attributes:
            metadata = metadata[attr]
        if transform is not None:
            metadata = transform(metadata)

        if exact_value is not None:
            return metadata == exact_value
        if within_range is not None:
            get_comp = lambda inclusive: (operator.le if inclusive else operator.lt)
            left_result = (
                get_comp(range_inclusive[0])(within_range[0], metadata)
                if within_range[0] is not None
                else True
            )
            right_result = (
                get_comp(range_inclusive[1])(metadata, within_range[1])
                if within_range[1] is not None
                else True
            )
            return left_result and right_result
        if value_set is not None:
            return metadata in value_set
        if custom_filter is not None:
            return custom_filter(metadata)

        # There is no way of distinguishing setting exact_value=None and not setting it at all,
        # so if everything is not set, we assume we are comparing metadata to a None value
        return metadata is None

    return attribute_filter
