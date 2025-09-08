# Memories - Project Tracking System

This folder contains the memory system for tracking project tasks, knowledge, and system status.

## Files

- `project-memory.json` - Main memory storage file
- `memory-manager.js` - Memory management script
- `README.md` - This documentation

## Quick Start

```bash
# Start a task
node memories/memory-manager.js start "Task Name" "Description"

# Complete a task
node memories/memory-manager.js complete "task_id" "Result"

# Check status
node memories/memory-manager.js status

# View summary
node memories/memory-manager.js summary
```

## Usage Examples

### Before Starting Work
```bash
node memories/memory-manager.js start "Fix login bug" "Resolve authentication issue in login component"
```

### After Completing Work
```bash
node memories/memory-manager.js complete "task_123456789" "Fixed JWT token validation and added error handling"
```

### Regular Check-ins
```bash
# See what's been completed
node memories/memory-manager.js summary

# Check system status
node memories/memory-manager.js status

# Review accumulated knowledge
node memories/memory-manager.js knowledge
```

## Memory Structure

The system tracks:
- **Tasks**: Work items with status, timing, and results
- **Project Info**: Name, version, description
- **Knowledge Base**: Technologies, components, findings
- **System Status**: Container health, ports, timestamps

## Integration

Use this system for all significant tasks to maintain project history and knowledge.

See `../AGENTS.md` for complete documentation.