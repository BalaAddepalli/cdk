# Architecture Diagrams

This directory contains visual architecture diagrams for the TypeScript Lambda CI/CD solution.

## Available Diagrams

### 1. Draw.io Format (`*.drawio`)
**Files**: `system-architecture.drawio`
**Purpose**: Interactive diagrams for detailed editing
**Best For**: Architecture reviews, presentations, detailed documentation

### 2. ASCII Format (`architecture-ascii.md`)
**Purpose**: Text-based diagrams that work everywhere
**Best For**: README files, terminal viewing, simple documentation
**Includes**:
- System architecture overview
- CI/CD pipeline flow
- Security architecture
- Network flow diagram
- Monitoring and observability
- Cost optimization architecture
- Well-Architected Framework alignment

### 3. Mermaid Format (`mermaid-diagrams.md`)
**Purpose**: Code-based diagrams with native GitHub/GitLab support
**Best For**: Documentation sites, GitHub README, version control
**Includes**:
- System architecture graph
- CI/CD pipeline flowchart
- Security architecture
- Data flow sequence diagram
- Monitoring architecture
- Cost optimization flow
- Deployment strategy (gitgraph)
- Error handling flow

## How to Use These Diagrams

### Opening the Diagrams
1. **Online**: Go to [draw.io](https://app.diagrams.net/) and open the `.drawio` files
2. **Desktop**: Download Draw.io desktop app and open the files
3. **VS Code**: Install the Draw.io Integration extension

### Editing the Diagrams
1. Open the diagram in Draw.io
2. Make your changes
3. Save the file
4. Commit the updated diagram to the repository

### Exporting Diagrams
From Draw.io, you can export to various formats:
- **PNG**: For presentations and documentation
- **SVG**: For scalable web use
- **PDF**: For formal documentation
- **HTML**: For interactive web pages

## Diagram Standards

### Color Coding
- **Purple (#e1d5e7)**: User interfaces and external systems
- **Green (#d5e8d4)**: Core application components
- **Blue (#dae8fc)**: AWS services and infrastructure
- **Yellow (#fff2cc)**: Monitoring and observability
- **Red (#f8cecc)**: Security and alerts
- **Gray (#f5f5f5)**: Containers and groupings

### Icon Standards
- Use consistent AWS service icons where available
- Maintain consistent sizing and spacing
- Include clear labels for all components
- Use arrows to show data flow and relationships

### Documentation Standards
- Include title and description for each diagram
- Add annotations for important features
- Include timing information where relevant
- Maintain version control for diagram updates

## Maintenance

### Regular Updates
- **Monthly**: Review diagrams for accuracy
- **After Changes**: Update diagrams when architecture changes
- **Quarterly**: Full review and optimization

### Version Control
- All diagrams are stored in Git
- Use meaningful commit messages for changes
- Tag major diagram versions
- Maintain change log for significant updates

## Integration with Documentation

These diagrams are referenced in:
- Main README.md
- Architecture documentation
- Security documentation
- Operations guides
- Stakeholder presentations

## Future Enhancements

### Planned Additions
- Network security diagram
- Data flow diagram
- Disaster recovery diagram
- Multi-region architecture diagram
- Service mesh integration diagram

### Interactive Features
- Clickable components linking to documentation
- Embedded metrics and status
- Real-time system status overlay
- Integration with monitoring dashboards

---

**Last Updated**: $(date)
**Maintained By**: Architecture Team
**Review Frequency**: Monthly