@app.get("/leadership/statistics", response_model=ThreadStatistics)
def get_leadership_statistics(user: _UserTD = Depends(auth.get_current_user)) -> ThreadStatistics:
    if user["role"] != "leadership":
        raise HTTPException(status_code=403, detail="access_denied")
    
    threads = store.list_threads()
    by_department: Dict[str, int] = {}
    
    # Count threads by status and department
    pending = 0
    in_progress = 0
    resolved = 0
    escalated = 0
    
    for thread in threads:
        # Count by status
        if thread.status == "pending":
            pending += 1
        elif thread.status == "in_progress":
            in_progress += 1
        elif thread.status == "resolved":
            resolved += 1
        elif thread.status == "escalated":
            escalated += 1
        
        # Count by department
        if thread.assigned_to:
            by_department[thread.assigned_to] = by_department.get(thread.assigned_to, 0) + 1
    
    return ThreadStatistics(
        total=len(threads),
        pending=pending,
        in_progress=in_progress,
        resolved=resolved,
        escalated=escalated,
        by_department=by_department
    )
