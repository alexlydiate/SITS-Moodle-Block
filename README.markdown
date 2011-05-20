##SITS-Moodle Integration Block for Moodle 1.9

##Installation

1) Copy the directory 'sits' into <moodle_root>/blocks/

2) Edit the file <moodle_root>/blocks/sits/config/sits_config.php to configure the block with your SITS database user, password and host address.

3) On the Moodle homepage click 'Notifications' - Moodle will then install the block.

##Be Aware

**The module is currently in a testing phase at the University of Bath** - we are due to go live in early August, in time for the new academic year.

**The block only supports SITS on Oracle databases**.

**If your Moodle is using MySQL with MyISAM table engines, and depending on the number of mappings made, the Full Sync of all mappings 
may have an adverse effect on Moodle's performance**.  This is due to the nature of MyISAM not supporting row-level locking, instead 
locking entire tables each time it is queried.   If you are using MySQL with InnoDB table engines, which is now default on v5.5.x and above,
the process should have little noticible effect on performance.  If you are using MyISAM engines you may wish to schedule Full Syncs in a quiet
period, or else simply sync each course individually.  On a wider note, you may wish to consider converting to InnoDB, which you may find
improves the performance of Moodle generally.

At the University of Bath we are running the Moodle database on InnoDB tables. A full sync of over 4000 active mappings is run every hour, 
taking just under 10 minutes.  However, as the module only updates where necessary, running the same sync from a fresh install will 
take considerably longer as each mapping is processed for the first time.

The block creates courses in Moodle for each and every active cohort in SITS - this is a requirement of the University of Bath, it may
not be desirable in every institution.  It would be a simple code change to change this behaviour, and should there be demand we may
write this in as a configurable option.

If a mapping finds that it wants to make an enrolment but that enrolment already exists it will takes ownership, linking that enrolment 
to the mapping, unless the role_assigment.enrol value is 'manual'.