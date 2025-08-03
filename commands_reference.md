## 📘 OpenObserve Assistant – Command Reference

This document contains all supported slash commands for working within the AI-buildable project system.

---

## 💬 `/explain` – Clarify a Concept

Used to clarify dense or abstract architectural replies.

### 🔹 How to Use
```plaintext
/explain
/explain [specific concept or message]
```

### 🔹 What Happens
1. Re-expresses prior message in plain language  
2. Adds a clear example or analogy  
3. Anchors to relevant context (e.g. RAG, prompt flow)

---

## 🧭 `/who` – Check Active Persona

Identifies the current persona responding and why.

### 🔹 How to Use
```plaintext
/who
```

### 🔹 What Happens
1. Shows who is active (e.g., Rishi, Sandeep, Yogi)  
2. Explains why they are leading  
3. Includes a one-line summary of their domain role

---

## 🛠️ `/issue` – Report Behavioral Problem

Flags role confusion, process misses, or collaboration issues.

### 🔹 How to Use
```plaintext
/issue - [describe the issue]
```

### 🔹 What Happens
1. Categorizes issue (e.g., tone, scope overstep)  
2. Suggests resolution  
3. Updates either `project_instructions.md` or `commands_reference.md` depending on which file the issue pertains to  
4. Asks for confirmation before applying

---

## 📄 `/doc` – Export Canvas or Topic Snapshot

Generates a Markdown export of the current work or a prior topic.

### 🔹 How to Use
```plaintext
/doc
/doc - [topic or label]
/doc -summary
```

### 🔹 What Happens
1. Outputs clean Markdown or summary thread  
2. Optionally includes jumpstart metadata for new threads  
3. Auto-names the file for Git sync

---

## 🆘 `/help` – List Commands

Displays all available team slash commands.

### 🔹 How to Use
```plaintext
/help
```

### 🔹 What Happens
1. Returns a short list of commands  
2. Shows what each one does

---

## 🗂️ `/files` – Manage Project Files

Views, uploads, and opens known files within the project scope.

### 🔹 How to Use
```plaintext
/files
/files - [filename]
/files - add
```

### 🔹 What Happens
1. Lists all registered canvases, docs, and assets  
2. Allows you to open any file by fuzzy match  
3. Uploads are attached to the active workspace

---

````markdown
## 🧬 `/git` Command – Repo State Sync from ZIP

Used to sync internal project file state with the latest uploaded `o2-v2.zip` GitHub repo snapshot.

### 🔹 How to Use
```plaintext
/git - [upload zip file]
````

### 🔹 What Happens When You Trigger `/git`

1. Unzips contents of uploaded `o2-v2.zip`
2. Rebuilds the full file registry and updates `repo_index.md`
3. Compares extracted content against previously synced state
4. Detects and lists:

   * `➕` Added files (new files not present before)
   * `➖` Removed files (no longer present in latest ZIP)
   * `🔁` Changed files (existing files with updated content)
5. For each changed file:

   * If it's a text file (`.md`, `.json`, `.ts`, etc.), shows a Git-style unified diff

### 🔹 Output Example

```plaintext
➕ Added:
- new_folder/new_doc.md

➖ Removed:
- archive/deleted_file.md

🔁 project_instructions.md
--- old/project_instructions.md
+++ new/project_instructions.md
@@ -2,6 +2,10 @@
📂 All core documents and architecture files created during this project can be accessed at:
+⚠️ Editing Protocol:
+Always close the open canvas...
```

> This diffing behavior ensures no content is silently overwritten. All changes are transparently surfaced for review before push.
