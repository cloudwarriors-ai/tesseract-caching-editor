# Tesseract Caching Editor - Agent Documentation

## 🧠 Memory System

This project uses a simple JSON-based memory system to track tasks, project state, and knowledge. The memory system is located in the `memories/` folder.

### Memory Structure

```
memories/
├── project-memory.json    # Main memory file
└── memory-manager.js      # Memory management script
```

### Memory Components

#### Project Information
- **Name**: Tesseract Caching Editor
- **Description**: React-based frontend for editing cached API responses
- **Version**: 1.0.0
- **Technologies**: React, TypeScript, Vite, Tailwind CSS, Playwright, Prism, Docker

#### Task Tracking
- **Task States**: `in_progress`, `completed`
- **Session Tracking**: Current session tasks and completion rate
- **Task Metadata**: Start time, duration, results

#### Knowledge Base
- **Technologies**: List of technologies used
- **Key Components**: Important system components
- **Important Findings**: Critical discoveries and solutions

#### System Status
- **Container Status**: Frontend and mock server health
- **Port Information**: Service endpoints
- **Health Checks**: Last verification times

### Using the Memory System

#### Before Starting a Task
```bash
# Start tracking a new task
node memories/memory-manager.js start "Task Name" "Task description"
```

#### After Completing a Task
```bash
# Mark task as completed
node memories/memory-manager.js complete "task_id" "Completion result"
```

#### Checking Status
```bash
# View current status
node memories/memory-manager.js status

# View task summary
node memories/memory-manager.js summary

# View knowledge base
node memories/memory-manager.js knowledge
```

### Memory Commands

| Command | Description | Example |
|---------|-------------|---------|
| `start` | Begin tracking a task | `start "Fix bug" "Fix the login issue"` |
| `complete` | Mark task as done | `complete "task_123" "Fixed successfully"` |
| `summary` | Show task statistics | `summary` |
| `status` | Show system status | `status` |
| `knowledge` | Show knowledge base | `knowledge` |

### Task Workflow

1. **Start Task**: Use `start` command before beginning work
2. **Work**: Perform the task
3. **Complete Task**: Use `complete` command when finished
4. **Review**: Use `summary` to see progress

### Example Usage

```bash
# Start a task
$ node memories/memory-manager.js start "Implement user authentication" "Add login/logout functionality"

🧠 MEMORY: Started task "Implement user authentication"
   📝 Description: Add login/logout functionality
   🆔 Task ID: task_1694123456789
   ⏰ Started: 2025-09-07T22:30:56.789Z

# Complete the task
$ node memories/memory-manager.js complete "task_1694123456789" "Successfully implemented JWT authentication"

✅ MEMORY: Completed task "Implement user authentication"
   🆔 Task ID: task_1694123456789
   ⏱️ Duration: 45s
   📊 Result: Successfully implemented JWT authentication
```

### Memory Data Structure

```json
{
  "project": {
    "name": "Tesseract Caching Editor",
    "version": "1.0.0",
    "created": "2025-09-07"
  },
  "tasks": [
    {
      "id": "task_1694123456789",
      "name": "Implement user authentication",
      "status": "completed",
      "started_at": "2025-09-07T22:30:56.789Z",
      "completed_at": "2025-09-07T22:31:41.789Z",
      "duration": 45000,
      "result": "Successfully implemented JWT authentication"
    }
  ],
  "current_session": {
    "tasks_completed": 1,
    "active_tasks": []
  },
  "knowledge_base": {
    "technologies": ["React", "TypeScript"],
    "important_findings": ["Prism --dynamic flag causes random data"]
  },
  "system_status": {
    "containers_running": true,
    "frontend_port": 3001,
    "mock_server_port": 4010
  }
}
```

### Integration Guidelines

#### For Agents/Automation
- Always use memory system for task tracking
- Start tasks before beginning work
- Complete tasks with meaningful results
- Update knowledge base with important findings

#### For Manual Tasks
- Use memory commands for consistency
- Document important discoveries
- Track time spent on tasks
- Maintain completion records

### Best Practices

1. **Descriptive Task Names**: Use clear, specific task names
2. **Detailed Descriptions**: Include context and objectives
3. **Meaningful Results**: Document what was accomplished
4. **Regular Updates**: Keep knowledge base current
5. **Consistent Usage**: Use memory system for all significant tasks

### Troubleshooting

#### Memory File Issues
- Check file permissions: `chmod 644 memories/project-memory.json`
- Validate JSON syntax if corrupted
- Backup important memory data before major changes

#### Script Issues
- Ensure Node.js is available: `node --version`
- Check script permissions: `chmod +x memories/memory-manager.js`
- Verify file paths are correct

### Future Enhancements

- [ ] Add task dependencies
- [ ] Implement task categories
- [ ] Add time tracking analytics
- [ ] Create web interface for memory management
- [ ] Add automated backups
- [ ] Implement memory search functionality

---

*Last updated: 2025-09-07*