---
sidebar_position: 3
---

# Data Model (Intermediate Representation)

The core data structure (IR) is defined using **Pydantic v2** models to guarantee fast, typed validation, serialization, and transparent compression:

```python
from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class AccessModifier(str, Enum):
    PUBLIC = "public"
    PROTECTED = "protected"
    PRIVATE = "private"

class EntityModel(BaseModel):
    name: str
    fully_qualified_name: str
    description: str = ""  # Normalized CommonMark Markdown
    access: AccessModifier = AccessModifier.PUBLIC
    file_path: str = ""
    line_range: Optional[Dict[str, int]] = None  # {"start": 12, "end": 45}
    is_ignored: bool = False  # Set to True if within DOM-IGNORE, \cond, or marked \internal
    
    # Reserved for future RAG phases (defaults to empty/None in MVP)
    signature_hash: Optional[str] = None
    dependencies: List[str] = Field(default_factory=list)

class ParameterModel(BaseModel):
    name: str
    type_name: str
    description: str = ""

class MethodModel(EntityModel):
    return_type: str
    parameters: List[ParameterModel] = Field(default_factory=list)
    is_override: bool = False  # Excluded from coverage calculations if True

class EnumMemberModel(BaseModel):
    name: str
    value: Optional[str] = None
    description: str = ""

class EnumModel(EntityModel):
    members: List[EnumMemberModel] = Field(default_factory=list)

class VariableModel(EntityModel):
    type_name: str
    is_static: bool = False
    is_trivial_property: bool = False  # Excluded from coverage calculations if True

class ConstantModel(EntityModel):
    type_name: str
    value: Optional[str] = None

class TypeAliasModel(EntityModel):
    target_type: str

class ClassModel(EntityModel):
    entity_type: str = "class"  # "class", "interface", "struct"
    base_classes: List[str] = Field(default_factory=list)
    methods: List[MethodModel] = Field(default_factory=list)
    variables: List[VariableModel] = Field(default_factory=list)
    constants: List[ConstantModel] = Field(default_factory=list)
    enums: List[EnumModel] = Field(default_factory=list)
    type_aliases: List[TypeAliasModel] = Field(default_factory=list)

class NamespaceModel(EntityModel):
    classes: List[ClassModel] = Field(default_factory=list)
    methods: List[MethodModel] = Field(default_factory=list)  # Global functions
    variables: List[VariableModel] = Field(default_factory=list)  # Global variables
    constants: List[ConstantModel] = Field(default_factory=list)  # Global constants
    enums: List[EnumModel] = Field(default_factory=list)  # Global enums
    type_aliases: List[TypeAliasModel] = Field(default_factory=list)  # Global type aliases

class ProjectCatalog(BaseModel):
    project_name: str
    version: str
    namespaces: List[NamespaceModel] = Field(default_factory=list)
```
